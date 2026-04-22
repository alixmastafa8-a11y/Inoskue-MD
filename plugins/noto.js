import axios from 'axios'
function toUnicode(input) {
    let pairs = []
    for (let i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) {
            if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
                pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000)
                i++
            }
        } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
            pairs.push(input.charCodeAt(i))
        }
    }
    return pairs.map(val => val.toString(16)).join('_')
}
let handler = async (m, { conn, text }) => {
    try {
        if (!text) {
            return m.reply(`❌ يرجى إدخال an emoji.\n\nمثال:\n.noto 😅`)
        }
        const unicode = toUnicode(text.trim())
        const url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicode}/512.webp`
        const check = await axios.head(url).catch(() => null)
        if (!check) throw new Error("Emoji not supported or invalid.")
        await conn.sendFile(
            m.chat,
            url,
            `${unicode}.webp`,
            `✅ *Noto Emoji Downloader*\n\n` +
            `Emoji: ${text}\n` +
            `Unicode: ${unicode}\n` +
            `Source: Google Noto Emoji\n\n` +
            `Powered by AgungDevX`,
            m
        )
    } catch (err) {
        m.reply(`❌ خطأ: ${err.message}`)
    }
}
handler.help = ['noto']
handler.command = ['noto']
handler.tags = ['ملصق']
handler.limit = true
export default handler