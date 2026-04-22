import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
let handler = async (m, { conn }) => {
  const quoted = m.quoted;
  if (!quoted || !quoted.download) {
    return conn.reply(
      m.chat,
      `❌ *No media detected!*\n\nPlease *reply to a file or image* with the command *.upload*\n\n📌 *Example usage:*\n> رد علىn image → *.upload*`,
      m
    );
  }
  await conn.reply(m.chat, '⏳ *Uploading your file, please wait...*', m);
  try {
    const buffer = await quoted.download();
    const mimeType = quoted.mimetype || 'application/octet-stream';
    const extension = mimeType.split('/')[1]?.split(';')[0] || 'bin';
    const fileName = quoted.filename || `upload_${Date.now()}.${extension}`;
    const tempPath = `/tmp/${fileName}`;
    fs.writeFileSync(tempPath, buffer);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempPath));
    const headers = {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://uploadf.com',
      'Referer': 'https://uploadf.com/id/',
      'X-Requested-With': 'XMLHttpRequest',
      ...formData.getHeaders()
    };
    const response = await axios.post('https://uploadf.com/fileup.php', formData, { headers });
    const data = response.data;
    fs.unlinkSync(tempPath);
    if (!data.FLG || !data.NAME) {
      throw new Error('Upload failed — no file link returned from server.');
    }
    const uploadedUrl = `https://uploadf.com/s/${data.NAME}`;
    const originalName = data.NRF || fileName;
    const resultMsg =
      `✅ *File Uploaded نجحfully!*\n\n` +
      `📁 *File Name:* ${originalName}\n` +
      `🔗 *Download Link:*\n${uploadedUrl}\n\n` +
      `_Powered by uploadf.com_`;
    await conn.reply(m.chat, resultMsg, m);
  } catch (err) {
    console.error('[upload handler error]', err.message);
    await conn.reply(
      m.chat,
      `❌ *Upload failed!*\n\n${err.message}\n\nPlease try again later.`,
      m
    );
  }
};
handler.help    = ['uploadf'];
handler.command = ['uploadf'];
handler.tags    = ['tools'];
handler.limit   = true;
export default handler;