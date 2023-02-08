import sample from 'lodash/sample.js';
import { nanoid } from 'nanoid';
import path from 'node:path'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
import { extractColorsFromImageData } from 'extract-colors';

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


export default async function handler(req, res) {
  const { text, og } = JSON.parse(req.query.data) || {};
  const imageWidth = 1000;
  const imageHeight = og ? 525 : imageWidth;
  const imageUrl = `https://source.unsplash.com/random/${imageWidth}x${imageHeight}/?inspire,sunset,motivation,failure,success`;
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
  const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);
  const colors = extractColorsFromImageData(imageData)

  await drawLogo(ctx, canvas);

  // font
  const fontFamily = sample(families);
  const lines = text || [];

  const lineHeight = og ? 1.1 : 1.2
  const textWidth = text => {
    const m = ctx.measureText(text);
    return [
      Math.round(m.width),
      Math.round(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent),
    ]
  }

  const maxWidth = canvas.width * (minmax(7, 9) / 10);
  const items = [];

  let maxFontSize = minmax(65, og ? 100 : 120);

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

    items.push({
      text: line,
      height: th,
      width: tw,
      font: `${localFontSize}px ${fontFamily}, Noto Color Emoji, Inter, sans-serif`,
      fontSize: localFontSize,
    })
  }

  const maxLineHeight = Math.max(...items.map(i => i.height))
  const totalHeight = maxLineHeight * items.length

  // draw
  let offsetY = (canvas.height - totalHeight) / 2;

  let drawPosition = 0;

  const highlightColor = sample([
    ...colors,
    { hex: "#ffcb02", lightness: 0, }
  ]);

  for (const item of items) {
    const isHighlightPosition = items.length > 1 && (drawPosition % 2 !== 0)
    const strokeColor = (isHighlightPosition && highlightColor.lightness < 0.6) ? 'white' : 'black';

    ctx.font = item.font;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;

    ctx.lineWidth = 6 + Math.floor(item.fontSize / 10)
    ctx.strokeText(item.text, (canvas.width - item.width) / 2, offsetY);


    if (isHighlightPosition) {
      ctx.fillStyle = highlightColor.hex;
    } else {
      ctx.fillStyle = '#fff';
    }

    ctx.fillText(item.text, (canvas.width - item.width) / 2, offsetY);
    offsetY += maxLineHeight * lineHeight;
    drawPosition++;

  }

  res.setHeader("Content-Disposition", `inline; filename=${filename}`);
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.send(canvas.toBuffer('image/jpeg', 80));
}
