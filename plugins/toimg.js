let handler = async (m, { conn, usedPrefix, command }) => {
    const notStickerMessage = `✳️ Respond to stickers with :\n\n *${usedPrefix + command}*`
    if (!m.quoted) throw notStickerMessage
    const q = m.quoted || m
    let mime = q.mediaType || ''
    if (/webp/.test(mime)) throw notStickerMessage
    let media = await q.download()
    await conn.sendMessage(m.chat, {image: media, caption: 'BOT_ AI'}, {quoted: m})
}
handler.help = ['toimg']
handler.tags = ['sticker']
handler.command = /^(toimg)$/i
handler.limit = true 
export default handler
 handler
