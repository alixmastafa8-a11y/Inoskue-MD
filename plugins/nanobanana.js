import crypto from 'crypto'
import fetch from 'node-fetch'
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`
const fp = crypto.randomUUID()
let cachethemeversi = null
const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'origin': 'https://aifaceswap.io',
  'referer': 'https://aifaceswap.io/nano-banana-ai/'
}
async function ambilthemeversi() {
  if (cachethemeversi) return cachethemeversi
  try {
    const gethtml = await fetch('https://aifaceswap.io/nano-banana-ai/')
    const html = await gethtml.text()
    const jsMatch = html.match(/src="([^"]*aifaceswap_nano_banana[^"]*\.js)"/)
    if (!jsMatch) throw new Error()
    let jsUrl = jsMatch[1].startsWith('http') ? jsMatch[1] : `https://aifaceswap.io${jsMatch[1]}`
    const jsRes = await fetch(jsUrl)
    const jsText = await jsRes.text()
    const themeMatch = jsText.match(/headers\["theme-version"\]="([^"]+)"/)
    cachethemeversi = themeMatch ? themeMatch[1] : 'EC25Co3HGfI91bGmpWR6JF0JKD+nZ/mD0OYvKNm5WUXcLfKnEE/80DQg60MXcYpM'
    return cachethemeversi
  } catch (e) {
    return 'EC25Co3HGfI91bGmpWR6JF0JKD+nZ/mD0OYvKNm5WUXcLfKnEE/80DQg60MXcYpM'
  }
}
async function gensigs() {
  const themeVersion = await ambilthemeversi()
  const aesSecret = crypto.randomBytes(8).toString('hex')
  const xGuide = crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, Buffer.from(aesSecret, 'utf8')).toString('base64')
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(aesSecret), Buffer.from(aesSecret))
  let fp1 = cipher.update('aifaceswap:' + fp, 'utf8', 'base64')
  fp1 += cipher.final('base64')
  return {
    'fp': fp,
    'fp1': fp1,
    'x-guide': xGuide,
    'x-code': Date.now().toString(),
    'theme-version': themeVersion
  }
}
async function upimage(imgBuffer, ext = 'jpg') {
  const filename = crypto.randomUUID().replace(/-/g, '') + '.' + ext
  const sigs = await gensigs()
  const res = await fetch('https://aifaceswap.io/api/upload_file', {
    method: 'POST',
    headers: { ...headers, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_name: filename,
      type: 'image',
      request_from: 1,
      origin_from: '4b06e7fa483b761a'
    })
  })
  const data = await res.json()
  const putUrl = data.data.url
  await fetch(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': `image/${ext}`, 'x-oss-storage-class': 'Standard' },
    body: imgBuffer
  })
  return putUrl.split('?')[0].split('.aliyuncs.com/')[1]
}
async function createJob(imgurl, prompt) {
  const sigs = await gensigs()
  const res = await fetch('https://aifaceswap.io/api/aikit/create', {
    method: 'POST',
    headers: { ...headers, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fn_name: 'demo-nano-banana',
      call_type: 1,
      input: {
        prompt,
        scene: 'standard',
        resolution: '1K',
        aspect_ratio: 'auto',
        source_images: [imgurl]
      },
      consume_type: 0,
      request_from: 1,
      origin_from: '4b06e7fa483b761a'
    })
  })
  const data = await res.json()
  return data.data.task_id
}
async function cekjob(jobId) {
  const sigs = await gensigs()
  const res = await fetch('https://aifaceswap.io/api/aikit/check_status', {
    method: 'POST',
    headers: { ...headers, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_id: jobId,
      fn_name: 'demo-nano-banana',
      call_type: 1,
      request_from: 1,
      origin_from: '4b06e7fa483b761a'
    })
  })
  const data = await res.json()
  return data.data
}
async function nanobanana(imgBuffer, ext, prompt) {
  const uploadUrl = await upimage(imgBuffer, ext)
  const jobId = await createJob(uploadUrl, prompt)
  let result
  do {
    await new Promise(resolve => setTimeout(resolve, 3000))
    result = await cekjob(jobId)
  } while (result && (result.status === 0 || result.status === 1))
  return {
    job_id: jobId,
    image: result.result_image
  }
}
// ─────────────────────────────────────────────
//                  HANDLER
// ─────────────────────────────────────────────
let handler = async (m, { conn }) => {
  const guide = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
│   🍌 *Nano Banana AI*   │
╰━━━━━━━━━━━━━━━━━━━━━━╯
*What is this feature?*
Nano Banana AI is a powerful AI image editing tool that lets you modify the background or style of a photo using a simple text prompt — powered by *aifaceswap.io*.
*How to use:*
1️⃣ أرسل صورة with the command as caption
2️⃣ Or reply to an existing image with the command + prompt
*مثال:*
• Send image with caption: \`.nanobanana add girl say nooo\`
• Reply to image: \`.nanobanana change background to a beach\`
*Tips for prompts:*
✏️ Be descriptive! The more detail you give, the better the result.
> "change background to a snowy mountain at night"
> "make it look like a cyberpunk city"
> "put the person in a sunflower garden"
⏳ جارٍ المعالجة may take *10–30 seconds*, please be patient.
⚠️ Only *image* media is supported (JPG/PNG).
`.trim()
  // ── Detect image source ──────────────────────────────
  // Case 1: user sends image with caption (.nanobanana <prompt>)
  const isDirectImage = m.message?.imageMessage
  // Case 2: user replies to an image with command + prompt
  const quotedMsg = m.quoted ? m.quoted : null
  const isQuotedImage = quotedMsg?.message?.imageMessage
  if (!isDirectImage && !isQuotedImage) {
    return conn.sendMessage(m.chat, { text: guide }, { quoted: m })
  }
  // ── Extract prompt ───────────────────────────────────
  // For direct image: caption is stored in imageMessage.caption, m.text includes the full caption
  // We strip the command word from the front to get the actual prompt
  let prompt = ''
  if (isDirectImage) {
    // m.text on an image message = the caption text (command already stripped by bot framework)
    prompt = m.text?.trim() || ''
  } else if (isQuotedImage) {
    // replied to image — prompt is the text after the command
    prompt = m.text?.trim() || ''
  }
  // Fallback if no prompt given
  if (!prompt) prompt = 'enhance the background'
  await conn.sendMessage(m.chat, {
    text: `⏳ *جارٍ المعالجة your image...*\n\n📝 Prompt: _${prompt}_\n\nيرجى الانتظار, this may take 10–30 seconds.`
  }, { quoted: m })
  try {
    // ── Download image ───────────────────────────────────
    const mediaMsg = isDirectImage ? m : quotedMsg
    const imgBuffer = await mediaMsg.download()
    const mimeType = isDirectImage
      ? (m.message?.imageMessage?.mimetype || 'image/jpeg')
      : (quotedMsg?.message?.imageMessage?.mimetype || 'image/jpeg')
    const ext = mimeType.split('/')[1]?.split(';')[0] || 'jpg'
    // ── Process & send ───────────────────────────────────
    const result = await nanobanana(imgBuffer, ext, prompt)
    if (!result?.image) {
      return conn.sendMessage(m.chat, {
        text: '❌ فشل to generate image. Please try again later.'
      }, { quoted: m })
    }
    const resultBuffer = await fetch(result.image).then(r => r.buffer())
    await conn.sendMessage(m.chat, {
      image: resultBuffer
    }, { quoted: m })
  } catch (err) {
    console.error('[nanobanana] Error:', err)
    await conn.sendMessage(m.chat, {
      text: `❌ حدث خطأ while processing your image.\n\nخطأ: ${err.message}`
    }, { quoted: m })
  }
}
handler.help = handler.command = ['nanobanana']
handler.tags = ['editor']
handler.limit = true
export default handler