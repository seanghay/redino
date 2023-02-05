import sample from 'lodash/sample.js';
import { nanoid } from 'nanoid';
import path from 'node:path'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
import QRCode from 'qrcode';
import { LogSnag } from 'logsnag';

const minmax = (min, max) => min + Math.floor(Math.random() * (max - min));

const families = [
  'Angkor', 'Battambang',
  'Bayon', 'Bokor',
  'Chenla', 'Content',
  'Dangrek', 'Hanuman',
  'Kantumruy', 'Kantumruy Pro',
  'Koh Santepheap', 'Koulen',
  'Metal', 'Moul',
  'Noto Serif Khmer', 'Odor Mean Chey',
  'Preahvihear', 'Siemreap',
  'Suwannaphum', 'Taprom'
]

// register fonts
GlobalFonts.loadFontsFromDir(path.join(process.cwd(), "fonts"));

let logoImage = null

async function drawLogo(ctx, canvas) {

  if (logoImage == null) {
    logoImage = await loadImage(path.join(process.cwd(), 'assets', "redino.png"));
  }

  const s = 110;
  const m = 44;
  const w = s;
  const h = s / (logoImage.width / logoImage.height);
  const position = Math.floor(Math.random() * 2);

  // top left
  if (position == 0) {
    ctx.drawImage(logoImage, m, m, w, h)
    return;
  }

  ctx.drawImage(logoImage, canvas.width - m - w, m, w, h)
}

async function drawBanner(canvas, ctx, content) {
  const qrcode = await loadImage(await QRCode.toBuffer(content, { width: 100, margin: 2 }));
  ctx.drawImage(qrcode, canvas.width - qrcode.width - 20, canvas.height - qrcode.height - 20);
}

export default async function handler(req, res) {
  const { text, og } = JSON.parse(req.query.data) || {};

  if (process.env.LOGSNAG_TOKEN && process.env.LOGSNAG_PROJECT) {
    const logsnag = new LogSnag({
      token: process.env.LOGSNAG_TOKEN,
      project: process.env.LOGSNAG_PROJECT,
    })

    await logsnag.publish({
      channel: "generate",
      icon: "⚡️",
      notify: false,
      event: "User Generated",
      description: text.join("."),
    });
  }

  const imageWidth = 1000;
  const imageHeight = og ? 525 : 1000;

  const imageUrl = `https://source.unsplash.com/random/${imageWidth}x${imageHeight}/?inspire,motivation,cat,landscape,work,failure,success,life&_id=${nanoid()}`;
  const image = await loadImage(imageUrl);
  const filename = nanoid() + ".jpg";
  const canvas = createCanvas(imageWidth, imageHeight);
  const ctx = canvas.getContext('2d');

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  await drawLogo(ctx, canvas);

  // font
  const fontFamily = sample(families);
  const lines = text || [];

  const lineHeight = 1.35
  const textWidth = text => {
    const m = ctx.measureText(text);
    return [
      Math.round(m.width),
      Math.round(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent),
    ]
  }

  const maxWidth = canvas.width * (minmax(7, 9) / 10);

  let totalHeight = 0;

  const items = [];

  let maxFontSize = minmax(65, 120);

  // layout
  for (const line of lines) {

    let localFontSize = 10;
    let tw = localFontSize;
    let th = localFontSize;

    while (tw < maxWidth) {
      ctx.font = `${localFontSize}px ${fontFamily}, Noto Color Emoji, Inter, sans-serif`;
      const [calcW, calcH] = textWidth(line);
      tw = calcW;
      th = calcH;
      localFontSize++;
      if (localFontSize >= maxFontSize) {
        break;
      }
    }

    totalHeight += th * lineHeight;

    items.push({
      text: line,
      height: th,
      width: tw,
      font: `${localFontSize}px ${fontFamily}, Noto Color Emoji, Inter, sans-serif`,
      fontSize: localFontSize,
    })
  }

  // draw
  let offsetY = (canvas.height - totalHeight) / 2;

  let drawPosition = 0;
  for (const item of items) {

    ctx.font = item.font;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 6 + Math.floor(item.fontSize / 10)
    ctx.strokeText(item.text, (canvas.width - item.width) / 2, offsetY);

    if (items.length > 1 && (drawPosition % 2 !== 0)) {
      ctx.fillStyle = sample(['#dae619', '#ffcb02']);
    } else {
      ctx.fillStyle = '#fff';
    }

    ctx.fillText(item.text, (canvas.width - item.width) / 2, offsetY);
    offsetY += item.fontSize * lineHeight;
    drawPosition++;

  }

  await drawBanner(canvas, ctx, 'https://redino.vercel.app/');
  res.setHeader("Content-Disposition", `inline; filename=${filename}`);
  res.setHeader("Content-Type", "image/jpeg");
  res.send(canvas.toBuffer('image/jpeg', 80));
}
