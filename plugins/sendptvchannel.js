const handler = async (m, { conn }) => {
  const channel = "120363377359042191@newsletter"
  let msg = m.quoted ? m.quoted : m
  let mime = (msg.msg || msg).mimetype || ""
  if (!mime.startsWith("video"))
    return m.reply("⚠️ يرجى إرسال or reply to a video")
  let media = await msg.download()
  await conn.sendMessage(channel, {
    video: media,
    mimetype: "video/mp4",
    ptv: true
  })
  m.reply("✅ Video sent as PTV successfully")
}
handler.command = ["sendptvchannel"]
handler.owner = true
export default handler