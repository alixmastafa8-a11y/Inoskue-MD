import fs from 'fs';
import { createCanvas } from 'canvas';
import Jimp from 'jimp';
import { ملصق } from '../lib/ملصق.js';
import uploadImage from '../lib/uploadImage.js';
let handler = async (m, { text }) => {
  if (!text) return m.reply("يرجى تقديم the text!\nمثال: .bart Hello World");
  const canvasSize = 500;
  const padding = 20;
  const maxFontSize = 120;
  const minFontSize = 20;
  const canvasWidth = canvasSize - 2 * padding;
  const preventSpamText = (text) => {
    const words = text.split(' ');
    let filteredWords = [];
    let prevWord = '';
    let count = 0;
    for (let word of words) {
      if (word === prevWord) {
        count++;
        if (count >= 3) {
          filteredWords.push("\n");
          count = 0;
        }
      } else {
        count = 1;
      }
      filteredWords.push(word);
      prevWord = word;
    }
    return filteredWords.join(' ');
  };
  const wrapText = (ctx, text, maxWidth, fontSize) => {
    ctx.font = `${fontSize}px Arial Narrow`;
    const lines = [];
    const segments = text.split(' ');
    let currentLine = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      let segmentProcessed = '';
      if (segment.length * (fontSize * 0.6) > maxWidth) {
        for (let j = 0; j < segment.length; j++) {
          const char = segment[j];
          const testLine = segmentProcessed + char;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth) {
            if (segmentProcessed !== '') {
              if (currentLine !== '') {
                lines.push(currentLine);
              }
              lines.push(segmentProcessed);
              currentLine = '';
              segmentProcessed = char;
            } else {
              lines.push(char);
            }
          } else {
            segmentProcessed += char;
          }
        }
        if (segmentProcessed !== '') {
          if (currentLine !== '') {
            const testLine = currentLine + ' ' + segmentProcessed;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth) {
              lines.push(currentLine);
              currentLine = segmentProcessed;
            } else {
              currentLine = testLine;
            }
          } else {
            currentLine = segmentProcessed;
          }
        }
      } else {
        const testLine = currentLine === '' ? segment : currentLine + ' ' + segment;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = segment;
        } else {
          currentLine = testLine;
        }
      }
    }
    if (currentLine !== '') {
      lines.push(currentLine);
    }
    return lines;
  };
  const determineFontSize = (ctx) => {
    let fontSize = maxFontSize;
    let lines;
    do {
      fontSize--;
      lines = wrapText(ctx, text, canvasWidth, fontSize);
    } while ((lines.length * fontSize * 1.5 > canvasSize - 2 * padding) && (fontSize > minFontSize));
    return Math.min(fontSize, maxFontSize);
  };
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cleanedText = preventSpamText(text);
  const fontSize = determineFontSize(ctx);
  const lineHeight = fontSize * 1.5;
  const lines = wrapText(ctx, cleanedText, canvasWidth, fontSize);
  ctx.font = `${fontSize}px Arial Narrow`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const totalTextHeight = lines.length * lineHeight;
  const startY = ((canvasSize - totalTextHeight) / 2) + 15;
  lines.forEach((line, i) => {
    ctx.fillText(line, padding, startY + i * lineHeight);
  });
  const imagePath = './tmp/bart.png';
  fs.writeFileSync(imagePath, canvas.toBuffer());
  const image = await Jimp.read(imagePath);
  image.blur(3);
  await image.writeAsync(imagePath);
  let buffer = fs.readFileSync(imagePath);
  let url = await uploadImage(buffer);
  let ملصقBuffer = await ملصق(false, url, global.packname, global.author);
  await conn.sendMessage(m.chat, { ملصق: ملصقBuffer }, { quoted: m });
  fs.unlinkSync(imagePath);
};
handler.help = ['bart2'];
handler.tags = ['ملصق'];
handler.command = ['bart2'];
handler.limit = true
export default handler;