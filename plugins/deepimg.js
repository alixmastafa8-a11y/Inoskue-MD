import axios from 'axios'
const translateToEnglish = async (text) => {
  try {
    const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`)
    return response.data[0][0][0]
  } catch (err) {
    console.error('Translation failed:', err)
    return text 
  }
}
let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`*「 DEEP IMAGE GENERATOR 」*
How to use:
.deepimg <prompt> | <style>
Example (English):
.deepimg City at night | Cyberpunk
Example (Arabic):
.deepimg مدينة في الليل | واقعي
If <style> is not provided, it will default to *realistic*`)
  }
  let [prompt, style] = text.split('|').map(a => a.trim())
  if (!prompt) return m.reply('يرجى إدخال a prompt! مثال: .deepimg City | Cyberpunk')
  style = (style || 'realistic')
  await m.reply('⏳ يرجى الانتظار, generating image...')
  const translatedPrompt = await translateToEnglish(prompt)
  const translatedStyle = await translateToEnglish(style)
  const deviceId = `dev-${Math.floor(Math.random() * 1000000)}`
  try {
    const response = await axios.post('https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev', {
      prompt: `${translatedPrompt} -style ${translatedStyle}`,
      size: "1024x1024",
      device_id: deviceId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://deepimg.ai',
        'Referer': 'https://deepimg.ai/',
      }
    })
    const data = response.data
    if (data?.data?.images?.length > 0) {
      const imageUrl = data.data.images[0].url
      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `✅ Image successfully generated!\n\n*Prompt (Original):* ${prompt}\n*Prompt (Used):* ${translatedPrompt}\n*Style:* ${style}`
      }, { quoted: m })
    } else {
      m.reply('❌ فشل to generate image.')
    }
  } catch (err) {
    console.error(err.response ? err.response.data : err.message)
    m.reply('❌ حدث خطأ while generating the image.')
  }
}
handler.help = ['deepimg']
handler.tags = ['ai']
handler.command = ['deepimg']
handler.limit = true
export default handler