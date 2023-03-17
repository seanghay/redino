import { createImage } from '@/src/canvas.js'
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * @param {import("next/server").NextRequest} req 
 * @param {import("next/server").NextResponse} res 
 */
export default async function (req, res) {

  if (req.method !== 'GET') {
    res.status(405).end()
    return;
  }

  const id = req.query.id;
  const value = await redis.get(`image:${id}`);

  if (!value) {
    res.status(404).end();
    return;
  }

  const canvas = await createImage(value, true);
  res.setHeader("Content-Disposition", `inline; filename=${id}.jpg`);
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.send(canvas.toBuffer('image/jpeg', 80));
  return;
}
