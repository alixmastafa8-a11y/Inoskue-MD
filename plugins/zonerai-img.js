import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
const resolutions = {
  portrait: { width: 768, height: 1344 },
  landscape: { width: 1344, height: 768 },
  square: { width: 1024, height: 1024 },
  ultra: { width: 1536, height: 1536 },
  tall: { width: 832, height: 1344 },
  wide: { width: 1344, height: 832 },
};
async function Txt2IMG(prompt, resolutionKey, upscale = 2) {
  const selectedResolution = resolutions[resolutionKey] || resolutions.portrait;
  const { width, height } = selectedResolution;
  const imagePromises = Array.from({ length: 3 }, (_, index) => {
    const form = new FormData();
    form.append('Prompt', prompt);
    form.append('Language', 'eng_Latn');
    form.append('Size', `${width}x${height}`);
    form.append('Upscale', upscale.toString());
    form.append('Batch_Index', index.toString());
    const agent = new https.Agent({ rejectUnauthorized: false });
    return axios.post(
      'https://api.zonerai.com/zoner-ai/txt2img',
      form,
      {
        httpsAgent: agent,
        headers: {
          ...form.getHeaders(),
          'Origin': 'https://zonerai.com',
          'Referer': 'https://zonerai.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        responseType: 'arraybuffer'
      }
    ).then(res => {
      const contentType = res.headers['content-type'] || 'image/jpeg';
      const fileId = res.headers['x-file-id'] || `zonerai-image-${Date.now()}-${index}`;
      const buffer = Buffer.from(res.data);
      return { buffer, contentType, fileId };
    });
  });
  try {
    return await Promise.all(imagePromises);
  } catch (error) {
    console.error('Image Generation Error:', error);
    throw new Error('فشل to generate images: ' + (error.response?.data?.toString() || error.message));
  }
}
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `يرجى تقديم a prompt to generate an image.\n\n*مثال:*\n${usedPrefix + command} a majestic lion in a futuristic city | landscape`;
  }
  let [prompt, resolutionKey] = text.split('|').map(s => s.trim());
  resolutionKey = resolutionKey || 'square'; 
  if (!resolutions[resolutionKey]) {
    throw `Invalid resolution: *${resolutionKey}*\n\nAvailable resolutions are:\n- ${Object.keys(resolutions).join('\n- ')}`;
  }
  try {
    await m.reply(`🎨 Generating images for "*${prompt}*" with *${resolutionKey}* resolution... يرجى الانتظار.`);
    const images = await Txt2IMG(prompt, resolutionKey);
    if (!images || images.length === 0) {
      throw 'The API did not return any images. Please try again.';
    }
    for (const img of images) {
      await conn.sendFile(
        m.chat,
        img.buffer,
        `${img.fileId}.jpg`,
        `*Prompt:* ${prompt}`,
        m
      );
    }
  } catch (e) {
    console.error(e);
    await m.reply(`حدث خطأ while generating the image: ${e.message}`);
  }
};
handler.help = ['zonerai-img'];
handler.command = ['zonerai-img'];
handler.tags = ['ai'];
handler.limit = true;
export default handler;