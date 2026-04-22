import axios from 'axios'
import * as cheerio from 'cheerio'
async function getBingImages(query, limit = 5) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  }
  const q = query.trim().split(/\s+/).join('+')
  const url = `https://www.bing.com/images/search?q=${q}&FORM=HDRSC2`
  try {
    const res = await axios.get(url, { headers })
    const $ = cheerio.load(res.data)
    const results = []
    $('a.iusc').each((i, el) => {
      try {
        const mRaw = $(el).attr('m') || '{}'
        const madRaw = $(el).attr('mad') || '{}'
        const m = JSON.parse(mRaw)
        const mad = JSON.parse(madRaw)
        const murl = m?.murl
        const turl = mad?.turl
        if (!murl) return
        const imageName = new URL(murl).pathname.split('/').pop()
        results.push({
          image_name: imageName,
          preview_url: turl,
          original_url: murl
        })
      } catch {}
    })
    return {
      query,
      count: results.length,
      results: results.slice(0, limit)
    }
  } catch (err) {
    return { error: `فشل في جلب الصور: ${err.message}` }
  }
}
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('من فضلك أدخل كلمة للبحث عن الصور 🖼️')
  m.reply('⏳ جاري البحث عن الصور، المرجو الانتظار...')
  const data = await getBingImages(text, 5)
  if (data?.error) return m.reply(`حدث خطأ: ${data.error}`)
  if (!data.results || data.results.length === 0) return m.reply('لم يتم العثور على أي صور 🥲')
  for (const result of data.results) {
    await conn.sendFile(m.chat, result.original_url, result.image_name, `🔍 نتيجة البحث: ${text}`, m)
  }
}
handler.help = handler.command = ['bingimages']
handler.tags = ['search']
handler.limit = true
export default handler