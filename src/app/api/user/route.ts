import { auth, currentUser } from "@clerk/nextjs/server";
import { getUser, upsertUser } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let user = await getUser(userId);

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || email;
    await upsertUser(userId, email, name);
    user = await getUser(userId);
  }

  return Response.json(user);
}
