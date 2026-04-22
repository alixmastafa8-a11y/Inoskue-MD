import axios from 'axios'
let handler = async (m, { conn, command, quoted, prefix }) => {
  const removal = {
    _hit: async (url, fetchName, returnType = "json", opts = {}) => {
      try {
        const response = await axios({
          method: opts.method || 'GET',
          url: url,
          headers: opts.headers,
          data: opts.body,
          responseType: returnType === 'json' ? 'json' : 'text'
        })
        return response.data
      } catch (error) {
        console.error(`[Removal._hit Error] Gagal di ${fetchName}:`, error.message)
        throw new Error(`Fetch gagal di ${fetchName}: ${error.message}`)
      }
    },
    _formData: (imageBuffer) => {
      const randomBoundary = "----WebKitFormBoundary" + Math.random().toString(32).slice(2)
      const buffers = [
        Buffer.from(`--${randomBoundary}\r\nContent-Disposition: form-data; name="image_file"; filename="rmbg_${Date.now()}.png"\r\nContent-Type: image/png\r\n\r\n`),
        imageBuffer,
        Buffer.from(`\r\n--${randomBoundary}--\r\n`)
      ]
      const body = Buffer.concat(buffers)
      const formDataHeaders = { "content-type": `multipart/form-data; boundary=${randomBoundary}` }
      return { formDataHeaders, body }
    },
    getWebToken: async () => {
      const html = await removal._hit("https://removal.ai/", "hit homepage", "text")
      const match = html.match(/var ajax_upload_object = (.*?);/)?.[1]
      if (!match) throw new Error(`لم يتم العثور على رمز التوكن.`)
      const { webtoken_url, security } = JSON.parse(match)
      const webTokenUrl = `${webtoken_url}?action=ajax_get_webtoken&security=${security}`
      const json = await removal._hit(webTokenUrl, "جلب رمز التوكن", "json")
      const webToken = json?.data?.webtoken
      if (!webToken) throw new Error(`تم الوصول للرابط لكن لم يتم الحصول على التوكن.`)
      return webToken
    },
    removeBackground: async (imageBuffer) => {
      const { formDataHeaders, body } = removal._formData(imageBuffer)
      const headers = {
        "web-token": await removal.getWebToken(),
        ...formDataHeaders
      }
      const opts = {
        headers,
        body,
        method: "POST"
      }
      return await removal._hit("https://api.removal.ai/3.0/remove", "remove background", "json", opts)
    }
  }
  try {
    let q = quoted ? quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) {
      return m.reply(`📸 رد على صورة أو أرسلها مع الأمر \n  *.removal*`)
    }
    await m.reply("🔄 جاري معالجة الصورة وحذف الخلفية...")
    let imageBuffer = await q.download()
    if (!imageBuffer) throw new Error("فشل في تحميل الصورة.")
    const result = await removal.removeBackground(imageBuffer)
    if (result && result.status === 200 && result.low_resolution) {
      await conn.sendMessage(m.chat, {
        image: { url: result.low_resolution },
        caption: `✨ تم حذف الخلفية بنجاح!`
      }, { quoted: m })
    } else {
      throw new Error(result.message || "فشل في الحصول على النتيجة من API.")
    }
  } catch (error) {
    console.error("❌ ERROR:", error)
    m.reply(`فشل في حذف الخلفية:\n*السبب:* ${error.message}`)
  }
}
handler.help = handler.command = ['removal']
handler.tags = ['editor']
handler.limit = true
export default handler