import sample from 'lodash/sample.js';
import path from 'node:path'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
import { extractColorsFromImageData } from 'extract-colors';
import axios from 'axios'
import isUrlHttp from 'is-url-http';
import { families } from './fonts.js'

GlobalFonts.loadFontsFromDir(path.join(process.cwd(), "fonts"));

function drawImageFill(canvas, context, image) {
  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;
  context.drawImage(image, x, y, width, height)
}

function textWidth(ctx, text) {
  const m = ctx.measureText(text);
  return [
    Math.round(m.width),
    Math.round(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent),
  ];
}

async function loadLogo(canvas) {
  const logoImage = await loadImage(path.join(process.cwd(), 'assets', "redino.png"));
  const s = 90;
  const m = 44;
  const w = s;
  const h = s / (logoImage.width / logoImage.height);
  const position = Math.floor(Math.random() * 2);

  // top left
  if (position == 0) {
    return (ctx) => ctx.drawImage(logoImage, m, m, w, h);
  }

  return (ctx) => ctx.drawImage(logoImage, canvas.width - m - w, m, w, h)
}

export function minmax(min, max) {
  return min + Math.floor(Math.random() * (max - min))
};



export async function createDefaultOptions(options = {}) {
  const imageSize = [1000, 1000];


  let imageUrl;
  let og;

  if (isUrlHttp(options.bg)) {
    imageUrl = options.bg;
    og = options.bg;
  } else {
    const topic = `?${options.bg}` || ""
    imageUrl = `https://source.unsplash.com/random/${imageSize[0]}x${imageSize[1]}/${topic}`;
    og = `https://source.unsplash.com/random/${imageSize[0]}x${525}/${topic}`;
    
    console.log({topic, imageUrl})

    const { headers } = await axios.head(imageUrl, {
      maxRedirects: 0,
      validateStatus() {
        return true;
      }
    });

    if (headers['location']) {
      imageUrl = headers['location'];
      const ogUrl = new URL(imageUrl);
      ogUrl.searchParams.set('h', 525)
      og = ogUrl.href;
    }
  }

  options.og = og;
  options.bg = imageUrl;
  options.font = options.font || sample(families);
  options.maxFontSize = options.maxFontSize || minmax(65, 100);
  options.maxWidthScale = options.maxWidthScale || (minmax(7, 9) / 10);

  return options;
}

export async function createImage(options = {}, isOG = false) {
  const fontFamily = options.font || sample(families);

  const imageSize = [1000, isOG ? 525 : 1000];
  const canvas = createCanvas(imageSize[0], imageSize[1]);
  const ctx = canvas.getContext('2d');

  // configure canvas context
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // fill the background & logo
  const [background, drawLogo] = await Promise.all([
    loadImage(isOG ? options.og : options.bg),
    loadLogo(canvas),
  ]);


  drawImageFill(canvas, ctx, background)

  const backgroundData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const backgroundColors = extractColorsFromImageData(backgroundData);

  // draw redino logo after the backgroud
  drawLogo(ctx);

  // text
  const lines = options.text || [];
  const lineHeight = 1.2;
  const maxWidthScale = options.maxWidthScale || (minmax(7, 9) / 10)
  const maxWidth = canvas.width * maxWidthScale;

  const items = [];

  let maxFontSize = options.maxFontSize || minmax(65, 120);

  for (const line of lines) {

    let localFontSize = 10;
    let tw = localFontSize;
    let th = localFontSize;

    while (tw < maxWidth) {
      ctx.font = `${localFontSize}px ${fontFamily}, Apple Color Emoji, Inter, sans-serif`;
      const [calcW, calcH] = textWidth(ctx, line);
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
      font: `${localFontSize}px ${fontFamily}, Apple Color Emoji, Inter, sans-serif`,
      fontSize: localFontSize,
    })
  }

  const maxLineHeight = Math.max(...items.map(i => i.height))
  const totalHeight = maxLineHeight * items.length;

  let offsetY = (canvas.height - totalHeight) / 2;
  let drawPosition = 0;

  const highlightColor = sample([
    ...backgroundColors,
    { hex: "#ffcb02", lightness: 0, }
  ]);

  const highlightColorPair = `${highlightColor.hex}:${highlightColor.lightness < 0.6 ? 'white' : 'black'}`
  const colors = (Array.isArray(options.colors)
    && options.colors.length > 0) ? options.colors : ['#fff:#000', highlightColorPair];

  const colorsSetAt = (position) => {
    let pair = colors[position % colors.length];

    if (pair.toLocaleLowerCase() === 'auto') {
      pair = highlightColorPair;
    }

    if (pair.includes(':')) {
      const chunks = pair.split(":");
      return {
        fillColor: chunks[0],
        strokeColor: chunks[1],
      }
    }

    return {
      fillColor: pair,
    };
  };

  for (const item of items) {
    const { fillColor, strokeColor } = colorsSetAt(drawPosition);
    ctx.font = item.font;
    ctx.lineWidth = 6 + Math.floor(item.fontSize / 10)

    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;
      ctx.strokeText(item.text, (canvas.width - item.width) / 2, offsetY);
    }

    ctx.fillStyle = fillColor;
    ctx.fillText(item.text, (canvas.width - item.width) / 2, offsetY);
    offsetY += maxLineHeight * lineHeight;
    drawPosition++;
  }

  return canvas;
}
