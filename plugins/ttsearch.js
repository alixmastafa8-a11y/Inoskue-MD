import axios from "axios"
const searchCache = new Map()
async function ttSearch(query) {
  const response = await axios.post(
    "https://tikwm.com/api/feed/search",
    new URLSearchParams({
      كلمة البحثs: query,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1,
    }),
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: "current_language=en",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
    }
  )
  return response.data.data
}
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    throw `مثال:\n${usedPrefix + command} cat\n${usedPrefix + command} 1`
  if (/^\d+$/.test(text)) {
    let cache = searchCache.get(m.chat)
    if (!cache)
      return m.reply("❌ No previous search.\nUse:\n.ttsearch cat")
    let number = parseInt(text)
    let video = cache.results[number - 1]
    if (!video)
      return m.reply("⚠️ Invalid number.")
    try {
      await m.reply("📥 Sending video...")
      let videoUrl = video.hdplay || video.play
      if (!videoUrl)
        return m.reply("❌ Video link غير موجود.")
      if (!videoUrl.startsWith("http"))
        videoUrl = "https://tikwm.com" + videoUrl
      await conn.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption:
            `🎬 ${video.title || "No title"}\n` +
            `👤 ${video.author?.nickname || "Unknown"}`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      m.reply("❌ فشل to send video.")
    }
    return
  }
  try {
    let res = await ttSearch(text)
    if (!res?.videos?.length)
      throw "لم يتم العثور على نتائج."
    searchCache.set(m.chat, {
      query: text,
      results: res.videos
    })
    let message =
      `📥 *Search Results for:* ${text}\n` +
      `رد بـ:\n${usedPrefix + command} 1\n\n`
    res.videos.forEach((v, i) => {
      message +=
        `*${i + 1}. ${v.title || "No title"}*\n` +
        `👤 ${v.author?.nickname || "Unknown"}\n` +
        `───────────────\n`
    })
    m.reply(message.trim())
  } catch (err) {
    console.error(err)
    m.reply("❌ Error fetching results.")
  }
}
handler.help = ["ttsearch"]
handler.tags = ["search"]
handler.command = ["ttsearch"]
handler.limit = true
export default handler