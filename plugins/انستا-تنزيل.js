import axios from 'axios';
import cheerio from 'cheerio';
const handler = async (m, { text, conn }) => {
  async function igdl(instagramUrl) {
    try {
      const response = await axios.post(
        'https://api.downloadgram.org/media',
        new URLSearchParams({ url: instagramUrl }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.163 Mobile Safari/537.36',
          },
        }
      );
      const $ = cheerio.load(response.data);
      let downloadLink = $('a').attr('href');
      return downloadLink ? downloadLink.replace(/\\"/g, '') : null;
    } catch (error) {
      console.error('حدث خطأ:', error.message);
      return null;
    }
  }
  if (text) {
    const instagramUrl = text.trim();
    const videoUrl = await igdl(instagramUrl);
    if (videoUrl) {
      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: 'Here is the video.',
      }, { quoted: m });
    } else {
      m.reply('Could not find the video or an error occurred.');
    }
  } else {
    m.reply('يرجى تقديم a valid Instagram URL.');
  }
};
handler.command = ['انستا-تنزيل'];
handler.help = ['انستا-تنزيل'];
handler.tags = ['downloader'];
handler.limit = true;
export default handler;