import startCase from 'lodash/startCase.js';
import sample from 'lodash/sample.js';
import fg from 'fast-glob';
import { nanoid } from 'nanoid';
import path from 'node:path'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'

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
  const position = Math.floor(Math.random() * 4);

  // top left
  if (position == 0) {
    ctx.drawImage(logoImage, m, m, w, h)
    return;
  }

  // top right
  if (position == 1) {
    ctx.drawImage(logoImage, canvas.width - m - w, m, w, h)
    return;
  }

  // bottom left
  if (position == 2) {
    ctx.drawImage(logoImage, m, canvas.height - m - h, w, h);
    return;
  }

  // bottom right
  ctx.drawImage(logoImage, canvas.width - m - w, canvas.height - m - h, w, h)
}

export default async function handler(req, res) {
  const { text } = JSON.parse(req.query.data) || {};
  const imageSize = 1000;
  const imageUrl = `https://source.unsplash.com/random/${imageSize}x${imageSize}/?inspire,motivation,cat,landscape,work,failure,success,life&_id=${nanoid()}`;
  const image = await loadImage(imageUrl);
  const filename = nanoid() + ".jpg";
  const canvas = createCanvas(imageSize, imageSize);
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

  const lineHeight = 1 + (1 / 3);
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
    offsetY += item.height * lineHeight;
    drawPosition++;
  }

  res.setHeader("Content-Disposition", `inline; filename=${filename}`);
  res.setHeader("Content-Type", "image/jpeg");
  res.send(canvas.toBuffer('image/jpeg', 95));
}
