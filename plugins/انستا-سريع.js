import axios from "axios"
async function fastdl(url) {
  try {
    url = url.split("?")[0]
    const headers = {
      accept: "*/*",
      "user-agent": "Mozilla/5.0 (Linux; Android 10)",
      referer: "https://fastdl.cc/"
    }
    let endpoint
    let referer
    if (url.includes("/reel/")) {
      endpoint = "reels/download"
      referer = "https://fastdl.cc/reels"
    } else if (url.includes("/stories/")) {
      endpoint = "story/download"
      referer = "https://fastdl.cc/story"
    } else {
      endpoint = "img/download"
      referer = "https://fastdl.cc/photo"
    }
    headers.referer = referer
    const { data } = await axios.get(
      `https://fastdl.cc/${endpoint}?url=${encodeURIComponent(url)}`,
      { headers }
    )
    if (!data.success) throw new Error("Media غير موجود")
    let media = []
    if (data.images) {
      media = data.images.map(v => v.url)
    } else if (data.url) {
      media = [data.url]
    }
    return {
      status: true,
      type: data.type,
      media
    }
  } catch (e) {
    return {
      status: false,
      message: e.message
    }
  }
}
let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    const guide = `
╔══════════════════════════════╗
║   📥  Instagram Downloader   ║
╚══════════════════════════════╝
*What is this?*
This feature lets you download media from Instagram — including *posts*, *reels*, and *stories* — directly in this chat.
*Supported content:*
  • 📸 Photos & carousel posts
  • 🎬 Reels / short videos
  • 📖 Stories
*How to use:*
  ${usedPrefix}${command} <Instagram URL>
*Examples:*
  ${usedPrefix}${command} https://www.instagram.com/p/XXXXXXXXX/
  ${usedPrefix}${command} https://www.instagram.com/reel/XXXXXXXXX/
  ${usedPrefix}${command} https://www.instagram.com/stories/username/XXXXXXXXX/
*Notes:*
  ⚠️ Only public content can be downloaded.
  ⚠️ Private accounts are not supported.
  ⚠️ Make sure to send the full Instagram link.
_Powered by FastDL.cc_
`.trim()
    return m.reply(guide)
  }
  const url = args[0]
  if (!url.includes("instagram.com")) {
    return m.reply("❌ رابط غير صالح. يرجى تقديم a valid Instagram link.\n\nمثال:\n.fastigdl https://www.instagram.com/p/XXXXXXXXX/")
  }
  await m.reply("⏳ Fetching media, please wait...")
  const result = await fastdl(url)
  if (!result.status) {
    return m.reply(`❌ فشل to fetch media.\nReason: ${result.message}\n\nMake sure the link is correct and the account is *public*.`)
  }
  if (!result.media || result.media.length === 0) {
    return m.reply("❌ No media found in that link.")
  }
  const caption = `✅ *Instagram Downloader*\n📦 Type: ${result.type || "unknown"}\n🗂️ Total: ${result.media.length} file(s)`
  for (let i = 0; i < result.media.length; i++) {
    const mediaUrl = result.media[i]
    try {
      if (result.type === "video" || result.type === "reel") {
        await conn.sendFile(m.chat, mediaUrl, "video.mp4", i === 0 ? caption : "", m)
      } else {
        await conn.sendFile(m.chat, mediaUrl, "photo.jpg", i === 0 ? caption : "", m)
      }
    } catch (sendErr) {
      await m.reply(`⚠️ فشل to send file ${i + 1}: ${sendErr.message}`)
    }
  }
}
handler.help = ['انستا-سريع']
handler.command = ['انستا-سريع']
handler.tags = ["downloader"]
handler.limit = true
export default handler