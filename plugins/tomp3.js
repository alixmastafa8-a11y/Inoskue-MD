import { toAudio } from '../lib/converter.js'
let handler = async (m, { conn, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    let q = m.quoted ? m.quoted : m
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) throw `Please reply with a video or voice note you want to convert to audio/mp3 using the caption *${usedPrefix + command}*`
    let media = await q.download?.()
    if (!media) throw 'Unable to download media'
    let audio = await toAudio(media, 'mp4')
    if (!audio.data) throw 'Unable to convert media to audio'
    conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, null, { mimetype: 'audio/mp4', asDocument: chat.useDocument })
}
handler.help = ['tomp3']
handler.tags = ['tools']
handler.command = /^to(mp3|a(udio)?)$/i
handler.limit = true 
export default handler