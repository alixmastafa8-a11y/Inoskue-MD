import fetch from 'node-fetch';
import cheerio from 'cheerio';
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🔍 يرجى إدخال a search query.\n\nمثال:\n.an1search capcut');
  const baseUrl = 'https://an1.com/';
  const queryParams = new URLSearchParams({
    story: text,
    do: 'search',
    subaction: 'search'
  });
  const url = `${baseUrl}?${queryParams.toString()}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    let result = '';
    $('.app_list .item_app').each((i, el) => {
      const name = $(el).find('.name a span').text().trim();
      const link = $(el).find('.name a').attr('href');
      const developer = $(el).find('.developer').text().trim();
      const ratingStyle = $(el).find('.rate_star .current-rating').attr('style');
      let rating = null;
      if (ratingStyle) {
        const match = ratingStyle.match(/width:(\d+)%/);
        if (match) {
          rating = (parseInt(match[1], 10) / 20).toFixed(1);
        }
      }
      const fullLink = new URL(link, baseUrl).href;
      result += `📱 *${name}*\n👨‍💻 Dev: ${developer}\n⭐ Rating: ${rating || 'N/A'}\n🔗 ${fullLink}\n\n`;
    });
    if (!result) return m.reply('❌ لم يتم العثور على نتائج.');
    await m.reply(result.trim());
  } catch (err) {
    console.error(err);
    m.reply('❌ فشل to search. Please try again later.');
  }
};
handler.help = ['بحث-برامج'];
handler.tags = ['search'];
handler.command = /^an1search$/i;
handler.limit = true;
export default handler;