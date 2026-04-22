import axios from 'axios'
import CryptoJS from 'crypto-js'
import fs from 'fs'
const AES_KEY = 'ai-enhancer-web__aes-key'
const AES_IV = 'aienhancer-aesiv'
function encryptSettings(obj) {
  return CryptoJS.AES.encrypt(
    JSON.stringify(obj),
    CryptoJS.enc.Utf8.parse(AES_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(AES_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString()
}
async function bananaAI(imagePath, prompt) {
  const img = fs.readFileSync(imagePath, 'base64')
  const settings = encryptSettings({
    prompt,
    aspect_ratio: 'match_input_image',
    output_format: 'png',
    max_images: 1,
    sequential_image_generation: 'disabled'
  })
  const create = await axios.post(
    'https://aienhancer.ai/api/v1/r/image-enhance/create',
    {
      model: 2,
      image: `data:image/jpeg;base64,${img}`,
      settings
    },
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
        'Content-Type': 'application/json',
        Origin: 'https://aienhancer.ai',
        Referer: 'https://aienhancer.ai/ai-image-editor'
      }
    }
  )
  const taskId = create.data.data.id
  while (true) {
    const result = await axios.post(
      'https://aienhancer.ai/api/v1/r/image-enhance/result',
      { task_id: taskId },
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
          'Content-Type': 'application/json',
          Origin: 'https://aienhancer.ai',
          Referer: 'https://aienhancer.ai/ai-image-editor'
        }
      }
    )
    if (result.data.data.status === 'succeeded') {
      return result.data.data.output
    }
    await new Promise(res => setTimeout(res, 3000))
  }
}
let handler = async (m, { conn, text }) => {
  if (!m.quoted) {
    return conn.reply(
      m.chat,
      '❌ You must reply to an image.\n\nمثال:\nReply to image → .banana-ai improve image quality',
      m
    )
  }
  if (!text) {
    return conn.reply(
      m.chat,
      '❌ يرجى تقديم a prompt.\n\nمثال:\n.banana-ai make the face clearer',
      m
    )
  }
  const media = await m.quoted.download()
  const imagePath = `./tmp/${Date.now()}.jpg`
  fs.writeFileSync(imagePath, media)
  await conn.reply(m.chat, '🍌 Banana AI is enhancing your image...\nيرجى الانتظار ⏳', m)
  try {
    const resultUrl = await bananaAI(imagePath, text)
    await conn.sendMessage(
      m.chat,
      {
        image: { url: resultUrl },
        caption: '✅ Banana AI enhancement completed!'
      },
      { quoted: m }
    )
  } catch (e) {
    conn.reply(m.chat, '❌ فشل to process image.\nPlease try again later.', m)
  } finally {
    fs.unlinkSync(imagePath)
  }
}
handler.help = handler.command = ['banana-ai']
handler.tags = ['ai']
handler.limit = true
export default handler