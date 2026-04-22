const upload = async function (buffer, ext = '.bin') {
  const origin = 'https://tmpfiles.org'
  const r1 = await fetch(origin)
  const rawCookie = r1.headers.get("set-cookie") || ""
  const cookie = rawCookie.split(",").map(v => v.split(";")[0]).join("; ")
  const html = await r1.text()
  const token = html.match(/token" value="(.+?)"/)?.[1]
  if (!token) throw Error("فشل to extract token")
  const file = new File([buffer], Date.now() + ext)
  const formData = new FormData()
  formData.append('_token', token)
  formData.append('upload', 'Upload')
  formData.append('file', file)
  const r2 = await fetch(origin, {
    headers: { cookie },
    body: formData,
    method: 'post'
  })
  const html2 = await r2.text()
  const filename = html2.match(/Filename(?:.+?)<td>(.+?)<\/td>/s)?.[1]
  const size = html2.match(/Size(?:.+?)<td>(.+?)<\/td>/s)?.[1]
  const url = html2.match(/URL(?:.+?)href="(.+?)"/s)?.[1]
  const expiresAt = html2.match(/Expires at(?:.+?)<td>(.+?)<\/td>/s)?.[1]
  if (!url) throw Error('فشل to get download URL')
  return { filename, size, expiresAt, url }
}
let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) throw `رد على file with *${usedPrefix + command}*`
  let mime = (m.quoted.msg || m.quoted).mimetype || ''
  if (!mime) throw 'No file found in reply.'
  let media = await m.quoted.download()
  let ext = mime.split('/')[1] ? `.${mime.split('/')[1]}` : '.bin'
  await m.reply('⏳ Uploading file, please wait...')
  try {
    let res = await upload(media, ext)
    await m.reply(
      `✅ File uploaded successfully\n\n📂 *Filename:* ${res.filename}\n📏 *Size:* ${res.size}\n⏱ *Expires:* ${res.expiresAt}\n🔗 *URL:* ${res.url}`
    )
  } catch (e) {
    await m.reply(`❌ Upload failed: ${e.message}`)
  }
}
handler.help = handler.command = ['tmpupload']
handler.tags = ['uploader']
handler.limit = true
export default handler