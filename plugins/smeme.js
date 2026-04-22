import fetch from "node-fetch"
import crypto from "crypto"
import sharp from "sharp"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
async function uploadToCatbox(buffer) {
  const type = await fileTypeFromBuffer(buffer)
  if (!type) throw new Error("Unsupported image type")
  const blob = new Blob([buffer], { type: type.mime })
  const form = new FormData()
  const name = crypto.randomBytes(5).toString("hex") + "." + type.ext
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", blob, name)
  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  })
  const url = await res.text()
  if (!url.startsWith("https://")) {
    throw new Error("Catbox upload failed")
  }
  return url.trim()
}
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return m.reply(
        `
🎨 *Meme Sticker Generator*
رد علىn image and add text.
📌 طريقة الاستخدام:
${usedPrefix + command} text
${usedPrefix + command} top | bottom
🧪 Examples:
${usedPrefix + command} Hello
${usedPrefix + command} When bot works | Perfectly 😎
        `.trim()
      )
    }
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""
    if (!/image\/(jpeg|png)/.test(mime)) {
      return m.reply("❌ Please reply to a JPG or PNG image.")
    }
    const imgBuffer = await q.download()
    if (!imgBuffer) return m.reply("❌ فشل to download image.")
    const imageUrl = await uploadToCatbox(imgBuffer)
    const input = args.join(" ").trim()
    let top = input
    let bottom = input
    if (input.includes("|")) {
      const parts = input.split("|")
      top = parts[0]?.trim() || input
      bottom = parts[1]?.trim() || parts[0]?.trim() || input
    }
    const proxiedBg = `https://images.weserv.nl/?url=${encodeURIComponent(
      imageUrl.replace(/^https?:\/\//, "")
    )}&output=png`
    const memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(
      top
    )}/${encodeURIComponent(
      bottom
    )}.png?background=${encodeURIComponent(proxiedBg)}`
    const pngBuffer = Buffer.from(
      await (await fetch(memeUrl)).arrayBuffer()
    )
    const webpBuffer = await sharp(pngBuffer)
      .resize(512, 512, { fit: "inside" })
      .webp({ quality: 85 })
      .toBuffer()
    await conn.sendMessage(
      m.chat,
      { ملصق: webpBuffer },
      { quoted: m }
    )
  } catch (err) {
    console.error(err)
    m.reply("❌ خطأ: " + err.message)
  }
}
handler.help = ["smeme"]
handler.tags = ["tools"]
handler.command = /^smeme$/i
handler.limit = true
export default handler