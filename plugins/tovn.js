import { toPTT } from '../lib/converter.js'
let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
  if (!/video|audio/.test(mime)) {
    throw `Please reply to a video or audio message with *${usedPrefix + command}* to convert it to a voice note.`
  }
  let media = await q.download?.()
  if (!media) throw 'فشل to download media.'
  let audio = await toPTT(media, 'mp4')
  if (!audio.data) throw 'فشل to convert media to voice note.'
  await conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, true, { mimetype: 'audio/mp4' })
}
handler.help = ['tovn']
handler.tags = ['tools']
handler.command = /^to(vn|(ptt)?)$/i
handler.limit = 4
export default handler