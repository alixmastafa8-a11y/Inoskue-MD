import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import axios from 'axios';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
function genserial() {
  let s = '';
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}
async function upimage(filename) {
  const form = new FormData();
  form.append('file_name', filename);
  const res = await axios.post(
    'https://api.imgupscaler.ai/api/common/upload/upload-image',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  );
  return res.data.result;
}
async function uploadToOSS(putUrl, filepath) {
  const type = path.extname(filepath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  const stream = fs.createReadStream(filepath);
  const res = await axios.put(putUrl, stream, {
    headers: { 'Content-Type': type },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });
  return res.status === 200;
}
async function createJob(imgUrl, originalText, replaceText) {
  const form = new FormData();
  form.append('original_image_url', imgUrl);
  form.append('original_text', originalText);
  form.append('replace_text', replaceText);
  const res = await axios.post(
    'https://api.magiceraser.org/api/magiceraser/v2/text-replace/create-job',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'product-code': 'magiceraser',
        'product-serial': genserial(),
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  );
  return res.data.result.job_id;
}
async function checkJob(jobId) {
  const res = await axios.get(
    `https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  );
  return res.data;
}
async function textReplace(imgBuffer, ext, originalText, replaceText) {
  const tmpPath = path.join(tmpdir(), `tr_${Date.now()}${ext}`);
  fs.writeFileSync(tmpPath, imgBuffer);
  try {
    const filename = path.basename(tmpPath);
    const uploadInfo = await upimage(filename);
    await uploadToOSS(uploadInfo.url, tmpPath);
    const cdnUrl = 'https://cdn.imgupscaler.ai/' + uploadInfo.object_name;
    const jobId = await createJob(cdnUrl, originalText, replaceText);
    let result;
    let attempts = 0;
    do {
      await new Promise(r => setTimeout(r, 3000));
      result = await checkJob(jobId);
      attempts++;
      if (attempts > 20) throw new Error('Timeout: job took too long');
    } while (!result.result || !result.result.output_url);
    return result.result.output_url[0];
  } finally {
    fs.unlinkSync(tmpPath);
  }
}
let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    const isImage = /image\/(jpe?g|png|webp)/.test(mime);
    const guide = `╭━━━━━━━━━━━━━━━━━━╮
┃   🖊️  *Text Replace*
╰━━━━━━━━━━━━━━━━━━╯
*What is this?*
This feature uses AI to detect and replace specific text found inside an image — without leaving any trace. Perfect for editing memes, screenshots, signs, or any image with visible text.
*How to use:*
رد علىn image with:
➜ \`${usedPrefix + command} original text | new text\`
*مثال:*
➜ \`${usedPrefix + command} Hello World | Silana Bot\`
*Notes:*
• The original text must exactly match what's visible in the image
• Works best with clear, readable fonts
• جارٍ المعالجة takes around 5–15 seconds`;
    if (!isImage) return m.reply(guide);
    if (!text || !text.includes('|')) {
      return m.reply(`❌ *Wrong format!*\n\nطريقة الاستخدام:\n\`${usedPrefix + command} original text | new text\`\n\nمثال:\n\`${usedPrefix + command} Hello | Silana Bot\``);
    }
    const [originalText, replaceText] = text.split('|').map(v => v.trim());
    if (!originalText || !replaceText) {
      return m.reply(`❌ *Both original text and replacement text are required.*\n\nمثال:\n\`${usedPrefix + command} Hello | Silana Bot\``);
    }
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    const imgBuffer = await q.download();
    const ext = mime.includes('png') ? '.png' : '.jpg';
    const resultUrl = await textReplace(imgBuffer, ext, originalText, replaceText);
    const resultBuffer = (await axios.get(resultUrl, { responseType: 'arraybuffer' })).data;
    await conn.sendMessage(m.chat, {
      image: Buffer.from(resultBuffer),
      caption: `✅ *Done!*\n\n"${originalText}" → "${replaceText}"`
    }, { quoted: m });
  } catch (e) {
    console.error('[textreplace]', e);
    m.reply(`❌ *فشل to replace text.*\n\n*Possible reasons:*\n• The original text doesn't match what's in the image\n• The image quality is too low\n• Service is temporarily unavailable`);
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
  }
};
handler.help = ['textreplace'];
handler.tags = ['editor'];
handler.command = /^(textreplace)$/i;
handler.limit = true;
handler.register = false;
export default handler;