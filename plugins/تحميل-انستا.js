import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'qs'
async function igdl(urls) {
  const [baseUrl, paramsString] = urls.split('?')
  const params = new URLSearchParams(paramsString)
  const url = baseUrl
  const igsh = params.get('igsh')
  let data = qs.stringify({
    'url': url,
    'igsh': igsh,
    'lang': 'en'
  })
  let config = {
    method: 'POST',
    url: 'https://api.instasave.website/media',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'origin': 'https://instasave.website',
      'referer': 'https://instasave.website/',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    data: data
  }
  try {
    const api = await axios.request(config)
    const $ = cheerio.load(api.data)
    const thumbnailUrl = $('img').attr('src')?.replace(/\\"/g, '')
    const downloadUrl = $('a').attr('href')?.replace(/\\"/g, '')
    return {
      thumbnail: thumbnailUrl,
      downloadUrl: downloadUrl
    }
  } catch (error) {
    console.error('Error fetching data:', error.message)
    return null
  }
}
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('يرجى تقديم a valid Instagram URL.')
  let result = await igdl(text)
  if (!result) return m.reply('فشل to fetch download link.')
  await conn.sendMessage(m.chat, {
    image: { url: result.thumbnail },
    caption: 'Here is the thumbnail preview.'
  }, { quoted: m })
  await conn.sendMessage(m.chat, {
    video: { url: result.downloadUrl },
    caption: 'Here is your Instagram video.'
  }, { quoted: m })
}
handler.help = handler.command = ['تحميل-انستا']
handler.tags = ['downloader']
handler.limit = true 
export default handler