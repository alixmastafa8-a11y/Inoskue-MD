import fetch from 'node-fetch'
import yts from 'yt-search'

const API_BASE = 'https://rest.apicausas.xyz/api/v1/descargas/youtube'
const API_KEY = 'causa-ee5ee31dcfc79da4'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const name = conn.getName(m.sender)
    const query = args.join(' ')

    if (!query) {
        return m.reply(`*🐗 Inoskue Play2*\n\n🎧 *مثال:*\n${usedPrefix + command} Linger`)
    }

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    try {
        const searchResult = await yts(query)
        const video = searchResult.videos?.[0]
        if (!video) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return m.reply(`❌ *لم يتم العثور على نتائج لـ "${query}"*`)
        }

        const captionInfo = `🎬 *العنوان:* ${video.title}\n👤 *القناة:* ${video.author.name}\n⏱️ *المدة:* ${video.timestamp}\n👁️ *المشاهدات:* ${video.views.toLocaleString()}\n\n📥 *جاري تحميل الصوت...*`
        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption: captionInfo
        }, { quoted: m })

        const response = await fetch(`${API_BASE}?url=${encodeURIComponent(video.url)}&type=audio&apikey=${API_KEY}`)
        const res = await response.json()

        if (res.status && res.data.download.url) {
            const { title, download: { url: downloadUrl } } = res.data

            await conn.sendMessage(m.chat, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: m })

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        } else {
            throw new Error('لا يمكن الحصول على رابط الصوت')
        }
    } catch (error) {
        console.error('Play2 Error:', error)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(`❌ *حدث خطأ:* ${error.message || 'فشل التحميل'}`)
    }
}

handler.help = ['play2']
handler.tags = ['downloader']
handler.command = ['play2']
handler.limit = true

export default handler
