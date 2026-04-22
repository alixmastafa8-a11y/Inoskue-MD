import axios from 'axios';
import cheerio from 'cheerio';
const handler = async (m, { conn, text }) => {
  if (!text || !text.startsWith('https://pastebin.com/')) {
    return await conn.sendMessage(
      m.chat,
      { text: '❗ يرجى تقديم a valid Pastebin URL. exemple : \n\n *.pastebindl*  https://pastebin.com/0M5rH5w5' },
      { quoted: m }
    );
  }
  try {
    const { data } = await axios.get(text);
    const $ = cheerio.load(data);
    const title = $('div.info-top h1').text().trim() || 'Title غير موجود';
    const rawLink = $('a[href^="/raw"]').attr('href');
    const downloadLink = $('a[href^="/dl"]').attr('href');
    const content = [];
    $('.source.text ol li').each((i, el) => content.push($(el).text().trim()));
    const username = $('div.username a').text().trim() || 'Username غير موجود';
    const datePosted = $('div.date span').text().trim() || 'Date غير موجود';
    const viewCount = $('div.visits').text().trim() || 'View count غير موجود';
    const caption = `🍁 *Retrieve Pastebin*\n\n` +
      `📌 *Title*: ${title}\n` +
      `👤 *Uploader*: ${username}\n` +
      `📅 *Date*: ${datePosted}\n` +
      `👀 *Views*: ${viewCount}\n\n` +
      `🔗 *Raw Link*: ${rawLink ? `https:
      `📥 *Download Link*: ${downloadLink ? `https:
      `📝 *Content*:\n${content.length ? content.join('\n') : 'No code content found.'}\n\n`;
    const documentContent = content.join('\n') || 'No content to save.';
    await conn.sendMessage(
      m.chat,
      {
        document: Buffer.from(documentContent, 'utf-8'),
        mimetype: 'application/octet-stream',
        fileName: 'pastebin_content.js',
        caption,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error('Error Issue:', error);
    await conn.sendMessage(
      m.chat,
      { text: `❗ حدث خطأ: ${error.message}` },
      { quoted: m }
    );
  }
};
handler.command = /^(pastebindl)$/i;
handler.tags = ['downloader'];
handler.help = ['pastebindl'];
handler.limit = true 
export default handler;