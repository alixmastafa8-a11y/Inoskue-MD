import axios from 'axios'
const handler = async (m, { text, conn }) => {
    if (!text) throw 'Please input some text first 🥺\nمثال: .aicheck hello world'
    try {
        const res = await axios.post(
            'https://reilaa.com/api/turnitin-match',
            {
                text: text
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        const data = res.data
        if (!data || !data.reilaaResult?.value) {
            throw 'The result is empty 😭'
        }
        const result = data.reilaaResult.value
        const output = `
✨ *Turnitin AI Checker* ✨
🧠 *Classification* : ${result.classification}
🎯 *AI Score*       : ${result.aiScore}%
⚠️ *Risk*           : ${result.details.analysis.risk}
💡 *Suggestion*     : ${result.details.analysis.suggestion}
📄 *Text* :
"${result.inputText}"
        `.trim()
        await conn.sendMessage(m.chat, { text: output }, { quoted: m })
    } catch (err) {
        await conn.sendMessage(
            m.chat,
            {
                text: `Oops, an error occurred 😿\n${err.response?.data?.message || err.message}`
            },
            { quoted: m }
        )
    }
}
handler.help = ['aicheck']
handler.tags = ['ai']
handler.command = /^(aicheck)$/i
handler.limit = false
export default handler