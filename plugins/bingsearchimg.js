import axios from 'axios'
import cheerio from 'cheerio'
let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, 'يرجى تقديم a search query.', m)
  }
  let result = await bingSearch(text)
  let message = `*🔍 BING IMAGE SEARCH RESULTS:*\nQuery: ${text}\n\n`
  if (result.items.length === 0) {
    message += 'No images found.'
  } else {
    result.items.slice(0, 5).forEach((item, i) => {
      message += `*${i + 1}.* ${item.title}\n`
      message += `Source: ${item.source.name}\n`
      message += `Image: ${item.images}\n`
      message += `URL: ${item.source.url}\n\n`
    })
  }
  conn.reply(m.chat, message, m)
}
handler.help = handler.command = ['bingsearchimg']
handler.tags = ['search']
handler.limit = true 
export default handler
async function bingSearch(query) {
  return axios.get(`https://www.bing.com/images/search?q=${query}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
    },
  }).then(function ({ data }) {
    let $ = cheerio.load(data)
    const url = []
    $(".iuscp").each((i, el) => {
      let img = $(el).find(".img_cont > img").attr("data-src")
      if (!img) return
      url.push({
        title: $(el).find(".b_dataList > li > a").text(),
        images: img,
        source: {
          name: $(el).find(".lnkw > a").attr("title").split(".")[0].toUpperCase(),
          url: $(el).find(".lnkw > a").attr("href")
        }
      })
    })
    return {
      total: `${url.length} Pages`,
      items: url
    }
  })
}