import axios from 'axios'
import cheerio from 'cheerio'
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('من فضلك أدخل الكلمة المفتاحية للبحث عن خلفيات مثل:\n\n.wallpaper anime')
  const searchUrl = `https://www.uhdpaper.com/search?q=${encodeURIComponent(text)}&by-date=true`
  try {
    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    })
    const $ = cheerio.load(data)
    let results = []
    $('.post-outer').each((_, el) => {
      const title = $(el).find('h2').text().trim()
      const resolution = $(el).find('b').text().trim()
      const image = $(el).find('img').attr('src')
      const description = $(el).find('p').text().trim()
      const source = $(el).find('a').text().trim()
      const link = $(el).find('a').attr('href')
      results.push({
        title,
        resolution,
        image,
        description,
        source,
        link
      })
    })
    if (results.length === 0) return m.reply('لم يتم العثور على أي خلفيات.')
    let res = results[0]
    let caption = `*${res.title}*\nResolution: ${res.resolution}\nDescription: ${res.description}\nSource: ${res.source}\nLink: ${res.link}`
    await conn.sendFile(m.chat, res.image, 'wallpaper.jpg', caption, m)
  } catch (err) {
    console.error(err)
    m.reply('حدث خطأ أثناء جلب البيانات.')
  }
}
handler.help = ['خلفيات']
handler.tags = ['downloader']
handler.command = ['خلفيات']
handler.limit = true 
export default handler