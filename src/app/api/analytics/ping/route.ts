import { NextRequest } from "next/server";
import { getRedis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) return Response.json({ ok: false });

  const { sessionId, path } = await req.json().catch(() => ({ sessionId: null, path: "/" }));
  if (!sessionId) return Response.json({ ok: false });

  const now = Date.now();
  const todayKey = `visitors:daily:${new Date().toISOString().slice(0, 10)}`;
  const onlineKey = `visitors:online`;

  // Track this session as online (expires after 90 seconds)
  await redis.setex(`session:${sessionId}`, 90, JSON.stringify({
    sessionId, path, lastSeen: now,
  }));

  // Add to online set (sorted set by timestamp, expire old ones)
  await redis.zadd(onlineKey, { score: now, member: sessionId });

  // Remove sessions older than 90 seconds from online set
  await redis.zremrangebyscore(onlineKey, 0, now - 90_000);

  // Increment daily unique visitors (HyperLogLog for deduplication)
  await redis.pfadd(todayKey, sessionId);
  // Expire daily key after 8 days
  await redis.expire(todayKey, 8 * 24 * 3600);

  // Total page views today
  const pvKey = `pageviews:${new Date().toISOString().slice(0, 10)}`;
  await redis.incr(pvKey);
  await redis.expire(pvKey, 8 * 24 * 3600);

  return Response.json({ ok: true });
}

export async function GET() {
  const redis = getRedis();
  if (!redis) return Response.json({ online: 0, today: 0, pageviews: 0, configured: false });

  const now = Date.now();
  const todayKey = `visitors:daily:${new Date().toISOString().slice(0, 10)}`;
  const pvKey = `pageviews:${new Date().toISOString().slice(0, 10)}`;
  const onlineKey = `visitors:online`;

  // Clean stale sessions
  await redis.zremrangebyscore(onlineKey, 0, now - 90_000);

  const [online, today, pageviews] = await Promise.all([
    redis.zcard(onlineKey),
    redis.pfcount(todayKey),
    redis.get<number>(pvKey),
  ]);

  // Last 7 days
  const days: { date: string; visitors: number; pageviews: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const [v, pv] = await Promise.all([
      redis.pfcount(`visitors:daily:${dateStr}`),
      redis.get<number>(`pageviews:${dateStr}`),
    ]);
    days.push({ date: dateStr, visitors: v ?? 0, pageviews: pv ?? 0 });
  }

  return Response.json({
    online: online ?? 0,
    today: today ?? 0,
    pageviews: pageviews ?? 0,
    days,
    configured: true,
  });
}
