import { getSupabaseAdmin } from "./supabase";

export type Plan = "free" | "pro";

export interface UserRecord {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  plan: Plan;
  messages_today: number;
  messages_total: number;
  last_reset: string;
  created_at: string;
  paypal_order_id?: string;
}

export const FREE_LIMIT = 10;
const WINDOW_MS = 5 * 60 * 60 * 1000; // 5-hour rolling window

export async function upsertUser(clerkId: string, email: string, name: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("users")
    .upsert(
      { clerk_id: clerkId, email, name, plan: "free", messages_today: 0, messages_total: 0 },
      { onConflict: "clerk_id", ignoreDuplicates: true }
    )
    .select()
    .single();
  if (error && error.code !== "23505") console.error("upsertUser error:", error);
  return data as UserRecord | null;
}

export async function getUser(clerkId: string): Promise<UserRecord | null> {
  const db = getSupabaseAdmin();
  const { data } = await db.from("users").select("*").eq("clerk_id", clerkId).single();
  return data as UserRecord | null;
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const db = getSupabaseAdmin();
  const { data } = await db.from("users").select("*").order("created_at", { ascending: false });
  return (data as UserRecord[]) ?? [];
}

export async function incrementMessageCount(clerkId: string): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  const user = await getUser(clerkId);
  if (!user) return { allowed: false, remaining: 0 };

  if (user.plan === "pro") {
    const db = getSupabaseAdmin();
    await db.from("users").update({ messages_total: (user.messages_total ?? 0) + 1 }).eq("clerk_id", clerkId);
    return { allowed: true, remaining: 9999 };
  }

  // 5-hour rolling window for free users
  const now = Date.now();
  const lastReset = user.last_reset ? new Date(user.last_reset).getTime() : 0;
  const windowExpired = (now - lastReset) >= WINDOW_MS;
  const windowCount = windowExpired ? 0 : (user.messages_today ?? 0);

  if (windowCount >= FREE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: lastReset + WINDOW_MS };
  }

  const db = getSupabaseAdmin();
  const updates: Record<string, unknown> = {
    messages_total: (user.messages_total ?? 0) + 1,
    messages_today: windowCount + 1,
  };
  if (windowExpired) updates.last_reset = new Date().toISOString();
  await db.from("users").update(updates).eq("clerk_id", clerkId);

  return { allowed: true, remaining: FREE_LIMIT - windowCount - 1 };
}

export async function upgradeToPro(clerkId: string, paypalOrderId: string) {
  const db = getSupabaseAdmin();
  await db.from("users").update({ plan: "pro", paypal_order_id: paypalOrderId }).eq("clerk_id", clerkId);
}
