import axios from 'axios'
async function reelsSearch(query, num = 10) {
  try {
    const cx = "e500c3a7a523b49df";
    const ins = axios.create({
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 16; SM-F966B Build) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'x-client-data': 'CJDjygE='
      }
    })
    const { data: init } = await ins.get("https://cse.google.com/cse.js", { params: { cx: cx } })
    const cfg_ = init.match(/}\)\(({[\s\S]*?})\);/);
    if (!cfg_ || !cfg_?.[1]) throw new Error("فشل to find config")
    const cfg = JSON.parse(cfg_[1])
    const params = {
      rsz: 'filtered_cse',
      num,
      hl: 'id',
      source: 'gcsc',
      cselibv: cfg.cselibVersion,
      cx: cx,
      q: query,
      safe: 'off',
      cse_tok: cfg.cse_token,
      lr: '',
      cr: '',
      gl: 'id',
      filter: 0,
      sort: '',
      as_oq: '',
      as_sitesearch: '',
      exp: 'cc,apo',
      oq: '',
      callback: 'google.search.cse.api11171',
      rurl: Buffer.from("aHR0cHM6Ly9yZWVsc2ZpbmRlci5zYXRpc2h5YWRhdi5jb20v", "base64").toString()
    };
    let ab = await ins.get('https://cse.google.com/cse/element/v1', {
      params,
    }).then(response => response.data)
    const jsonStartIndex = ab.indexOf('{');
    const jsonEndIndex = ab.lastIndexOf('}');
    const jsonString = ab.slice(jsonStartIndex, jsonEndIndex + 1);
    const jsonData = JSON.parse(jsonString);
    return jsonData.results
      .filter(item => item?.richSnippet?.metatags) 
      .map(item => ({
        title: item.richSnippet.metatags.ogTitle || item.title || 'No Title',
        description: item.richSnippet.metatags.ogDescription || item.snippet || 'No Description',
        url: item.url || item.link,
        image: item.richSnippet.metatags.ogImage || item.pagemap?.cse_thumbnail?.[0]?.src || null
      }))
  } catch(e) {
    throw e
  }
}
let handler = async (m, { conn, text, args }) => {
  if (!text) {
    return m.reply(`
📱 *Instagram Reels Search*
🔍 *What is this?*
This feature allows you to search for Instagram Reels videos based on كلمة البحثs or topics.
📝 *How to use:*
.igsearch <your search query>
💡 *Examples:*
• .igsearch funny cats
• .igsearch cooking recipes
• .igsearch travel vlog
• .igsearch dance challenge
⚡ *Note:*
The bot will return up to 10 Instagram Reels results matching your search query.
    `)
  }
  try {
    m.reply("🔎 Searching for Instagram Reels...")
    const results = await reelsSearch(text, 10)
    if (!results || results.length === 0) {
      return m.reply("❌ لم يتم العثور على نتائج. Try different كلمة البحثs.")
    }
    let message = `🎬 *Instagram Reels Search Results*\n`
    message += `📊 Found ${results.length} results for: *${text}*\n\n`
    results.forEach((item, index) => {
      message += `*${index + 1}. ${item.title}*\n`
      message += `📝 ${item.description}\n`
      message += `🔗 ${item.url}\n\n`
    })
    message += `\n💡 *Tip:* Copy the URL to download the reel!`
    if (results[0].image) {
      await conn.sendMessage(m.chat, {
        image: { url: results[0].image },
        caption: message
      }, { quoted: m })
    } else {
      await m.reply(message)
    }
  } catch (e) {
    m.reply(`❌ خطأ: ${e.message || e}`)
    console.error(e)
  }
}
handler.help = ['بحث-انستا']
handler.command = ['بحث-انستا']
handler.tags = ['search']
handler.limit = true
export default handler