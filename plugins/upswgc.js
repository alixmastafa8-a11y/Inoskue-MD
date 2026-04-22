import { prepareWAMessageMedia } from '@adiwajshing/baileys'
const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text && !m.quoted) {
        return m.reply(`مثال: ${usedPrefix + command} <text>\nor reply to a photo/video/audio`)
    }
    try {
        if (text) {
            await conn.relayMessage(
                m.chat,
                {
                    groupStatusMessageV2: {
                        message: { conversation: text }
                    }
                },
                {}
            )
            return m.reply("Done")
        }
        if (m.quoted) {
            const mime = m.quoted.mimetype || ''
            const buffer = await m.quoted.download()
            if (!buffer) return m.reply("No media available for upload")
            let media
            if (/image/.test(mime)) {
                media = await prepareWAMessageMedia(
                    { image: buffer },
                    { upload: conn.waUploadToServer }
                )
            } else if (/video/.test(mime)) {
                media = await prepareWAMessageMedia(
                    { video: buffer },
                    { upload: conn.waUploadToServer }
                )
            } else if (/audio/.test(mime)) {
                media = await prepareWAMessageMedia(
                    {
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        ptt: false
                    },
                    { upload: conn.waUploadToServer }
                )
            } else {
                return m.reply("Unsupported media format")
            }
            await conn.relayMessage(
                m.chat,
                {
                    groupStatusMessageV2: {
                        message: media
                    }
                },
                {}
            )
            return m.reply("Done")
        }
    } catch (err) {
        console.error(err)
        m.reply("فشل to upload status")
    }
}
handler.command = /^upswgc$/i
handler.owner = true
handler.group = true
handler.help = ["upswgc"]
handler.tags = ["owner"]
export default handler