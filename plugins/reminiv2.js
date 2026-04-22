import axios from 'axios';
import FormData from 'form-data';
let handler = async (m, { conn, command, quoted, prefix, usedPrefix, text }) => {
  let q = quoted ? quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(`Send or reply to an image with the caption *${usedPrefix + command}*`);
  }
  await m.reply("⏳ يرجى الانتظار a moment... \ninstagram.com/noureddine_ouafy");
  try {
    const media = await q.download();
    const form = new FormData();
    form.append('image', media, {
      filename: 'image.jpg',
      contentType: mime
    });
    const { data: upscaledBuffer } = await axios.post(
      'https://xyro.site/ai/upscaler',
      form,
      {
        headers: form.getHeaders(),
        responseType: 'arraybuffer'
      }
    );
    await conn.sendMessage(
      m.chat,
      {
        image: upscaledBuffer,
        caption: '✅ Image successfully upscaled'
      },
      { quoted: m }
    );
  } catch (e) {
    console.error('[UPSCALE ERROR]', e);
    m.reply('❌ حدث خطأ while processing the image!');
  }
};
handler.help = ['reminiv2'];
handler.tags = ['tools'];
handler.command = /^(reminiv2)$/i;
handler.limit = true
export default handler;