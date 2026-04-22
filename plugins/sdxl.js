import axios from 'axios';
async function generateMagicEraser(promptText) {
  const baseUrl = 'https://apiimagen.magiceraser.fyi';
  const endpoint = '/imagen_v1';
  const params = {
    size: '1080x1920', 
    negative_prompt: null,
    style: null,
    custom_style: null,
    prompt: promptText,
    version: 'sdxl'
  };
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'User-Agent': 'Dalvik/2.1.0', 
    'Accept-Encoding': 'gzip'
  };
  try {
    const response = await axios({
      method: 'post',
      url: baseUrl + endpoint,
      params: params,
      headers: headers,
      responseType: 'arraybuffer' 
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ Error in generateMagicEraser:', error.message);
    throw new Error('فشل to contact the Magic Eraser API. It may be temporarily unavailable.');
  }
}
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `يرجى تقديم a prompt to create an image.\n\n*مثال:* ${usedPrefix}${command} a majestic lion in a flower field`;
  }
  await m.reply("🎨 Generating your image with SDXL, please wait a moment...");
  try {
    const imageBuffer = await generateMagicEraser(text);
    const caption = `*Prompt:* ${text}`;
    await conn.sendMessage(m.chat, { image: imageBuffer, caption: caption }, { quoted: m });
  } catch (error) {
    console.error(error);
    m.reply(`Sorry, an error occurred: ${error.message}`);
  }
};
handler.help = ['sdxl '];
handler.command = ['sdxl'];
handler.tags = ['ai'];
handler.limit = true; 
export default handler;