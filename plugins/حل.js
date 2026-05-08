import axios from 'axios'
import crypto from 'crypto'
import FormData from 'form-data'
import fs from 'fs'

function detectLanguage(text = '') {
    const arabicRegex = /[\u0600-\u06FF]/
    if (arabicRegex.test(text)) return 'ar'
    return 'en'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
            return m.reply(
                `╭─── 「 **تـحـلـيـل الـصـور** 」 ───⚔️\n│\n` +
                `│ 📌 *ميزة تحليل الصور بالذكاء الاصطناعي*\n│\n` +
                `│ *قم بالرد على صورة واكتب:*\n` +
                `│ ${usedPrefix + command} حل هذا التمرين\n│\n` +
                `╰──────────────────• 🐗`
            )
        }

        const media = await m.quoted.download()
        const filePath = `./temp_${Date.now()}.jpg`
        fs.writeFileSync(filePath, media)

        const userPrompt = text || "ماذا يوجد في هذه الصورة؟"
        const detectedLang = detectLanguage(userPrompt)

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
        await m.reply("⏳ جاري رفع الصورة للمعالجة...")

        const formData = new FormData()
        formData.append('reqtype', 'fileupload')
        formData.append('fileToUpload', fs.createReadStream(filePath))

        const uploadResponse = await axios.post(
            'https://catbox.moe/user/api.php',
            formData,
            { headers: formData.getHeaders() }
        )

        const imageUrl = uploadResponse.data.trim()
        const conversationId = crypto.randomUUID()

        await conn.sendMessage(m.chat, { react: { text: "🤖", key: m.key } })
        await m.reply("🤖 جاري تحليل الصورة، يرجى الانتظار...")

        const payload = {
            message: userPrompt,
            language: detectedLang,
            model: "gemini-3-flash-preview",
            tone: "default",
            length: "moderate",
            conversation_id: conversationId,
            image_urls: [imageUrl],
            stream_url: "/api/v2/homework/stream"
        }

        const response = await axios.post(
            'https://notegpt.io/api/v2/homework/stream',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://notegpt.io',
                    'Referer': 'https://notegpt.io/ai-answer-generator',
                    'User-Agent': 'Mozilla/5.0'
                },
                responseType: 'stream'
            }
        )

        let fullText = ''

        await new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n')
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.slice(6)
                            if (!jsonStr) continue
                            const data = JSON.parse(jsonStr)
                            if (data.text) fullText += data.text
                            if (data.done) resolve()
                        } catch {}
                    }
                }
            })

            response.data.on('end', resolve)
            response.data.on('error', reject)
        })

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

        if (!fullText) return m.reply("❌ لم يتم استلام رد من الخادم.")

        let finalMsg = `╭─── 「 **نـتـيـجـة الـتـحـلـيـل** 」 ───⚔️\n\n${fullText}\n\n╰──────────────────• 🐗`
        
        await m.reply(finalMsg)
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

    } catch (err) {
        console.error(err)
        m.reply("❌ حدث خطأ أثناء معالجة الصورة.")
    }
}

handler.help = ['analyze']
handler.command = ['analyze', 'حل', 'حلل']
handler.tags = ['ai']
handler.limit = true

export default handler
