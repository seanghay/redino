import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import requestIp from 'request-ip';
import { nanoid } from 'nanoid';
import { createDefaultOptions } from '@/src/canvas.js'

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1m"),
});

/**
 * @param {import("next/server").NextRequest} req 
 * @param {import("next/server").NextResponse} res 
 */
export default async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return;
  }

  const identifier = requestIp.getClientIp(req);
  const result = await ratelimit.limit(identifier);


  res.setHeader("X-RateLimit-Limit", result.limit);
  res.setHeader("X-RateLimit-Remaining", result.remaining);
  res.setHeader('X-RateLimit-Reset', result.reset);

  if (!result.success) {
    res.status(429).end("429 Too Many Requests");
    return;
  }

  const id = nanoid(11);
  const options = await createDefaultOptions(req.body);
  redis.set(`image:${id}`, options);
  res.json({ id });
  return;
}