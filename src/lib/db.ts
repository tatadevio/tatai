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

export async function incrementMessageCount(clerkId: string): Promise<{ allowed: boolean; remaining: number }> {
  const user = await getUser(clerkId);
  if (!user) return { allowed: false, remaining: 0 };

  const totalCount = user.messages_total ?? 0;

  if (user.plan === "free" && totalCount >= FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  const db = getSupabaseAdmin();
  await db
    .from("users")
    .update({
      messages_total: totalCount + 1,
      messages_today: (user.messages_today ?? 0) + 1,
    })
    .eq("clerk_id", clerkId);

  const remaining = user.plan === "pro" ? 9999 : FREE_LIMIT - totalCount - 1;
  return { allowed: true, remaining };
}

export async function upgradeToPro(clerkId: string, paypalOrderId: string) {
  const db = getSupabaseAdmin();
  await db.from("users").update({ plan: "pro", paypal_order_id: paypalOrderId }).eq("clerk_id", clerkId);
}
