import axios from "axios"
const UA = "okhttp/5.3.2"
const FBASE = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyB8XaGLKyMR1t8jT_NSMhsVi0acvtGL0Vk"
const STS = "https://airbrush.com/core-api/v1/upload/sts"
const PUTU = "https://object.pixocial.com/pixbizstorage-temp/"
const PKEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1UFKuWoaZLOSpHr81wwv
phUO51oKeQiJ41A4ccaQz/QOEXzypl8uXGN/5isVJlW7Px1DPogY/jd5wro7h7nJ
7LVdowOyD7OTDScCW6A1T1ri1toNt/mROXNcbNAUtmNj1ZyR3g5ylJQNNDZgiN4u
iU6AxIs6xeQ57LQAL394NoEN1VdobRTfW2YQzHOhHqRDgt3w2hvtBLTj9PQEJf/8
hz6hS2G8qXQO1aKcdj89u4w3TiHH/kHzyLWflLbIyQaDC9XdcVhgiXHBM5pm0xEY
dMnqJFEOvL383ex0BNQSLK8tkNxyNbyOTyBDhMpipcQfaR62lAi7lpmSPtyVGS9m
XwIDAQAB
-----END PUBLIC KEY-----`
const MODES = {
  anime: {
    styles: ["dreamAnime", "cartoon", "ghibby", "toon", "cleanLine"],
    creat: (src, style) => ({
      url: "https://airbrush.com/core-api/v1/anime/create",
      body: { styleName: style || "dreamAnime", source: src }
    }),
    query: tid => ({
      url: `https://airbrush.com/core-api/v1/anime/query/${tid}`
    }),
    result: d => d?.effectUrl,
    done: d => d?.status === "success",
    pending: d => d?.status === "pending"
  }
}
const hdr = (tok) => ({
  "User-Agent": UA,
  "x-anonymous-uid": tok,
  "Content-Type": "application/json",
  "x-tenant": "ab"
})
const wait = ms => new Promise(r => setTimeout(r, ms))
class Airbrush {
  constructor() {
    this.tok = null
  }
  async _auth() {
    if (this.tok) return this.tok
    const { data } = await axios.post(FBASE, { returnSecureToken: true }, { headers: { "User-Agent": UA } })
    this.tok = data?.idToken
    return this.tok
  }
  async _buf(url) {
    const { data } = await axios.get(url, { responseType: "arraybuffer" })
    return Buffer.from(data)
  }
  async _sts(tok) {
    const { data } = await axios.post(STS, { publicKey: PKEY }, { headers: hdr(tok) })
    return data?.client?.sessionToken
  }
  async _put(buf, st) {
    const fname = `airbrush_${Date.now()}.jpg`
    const url = `${PUTU}${fname}?x-id=PutObject`
    await axios.put(url, buf, {
      headers: {
        "User-Agent": UA,
        "content-type": "image/jpeg",
        "x-amz-security-token": st
      }
    })
    return `${PUTU}${fname}`
  }
  async _poll(tok, tid, mode) {
    const cfg = MODES[mode]
    const { url } = cfg.query(tid)
    for (let i = 0; i < 60; i++) {
      await wait(3000)
      const { data } = await axios.get(url, { headers: hdr(tok) })
      if (cfg.done(data)) return cfg.result(data)
      if (!cfg.pending(data)) throw new Error("Unexpected status")
    }
    throw new Error("Timeout")
  }
  async generate({ image, mode = "anime", style }) {
    const tok = await this._auth()
    const buf = await this._buf(image)
    const st = await this._sts(tok)
    const src = await this._put(buf, st)
    const tid = await axios.post(
      MODES[mode].creat(src, style).url,
      MODES[mode].creat(src, style).body,
      { headers: hdr(tok) }
    ).then(res => res.data?.taskId)
    return await this._poll(tok, tid, mode)
  }
}
let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(`
🎨 *Airbrush AI Generator*
This feature transforms your image into anime/cartoon style using AI.
📌 *How to use:*
رد علىn image OR send an image URL with command:
.airbrush <image_url> [style]
مثال:
.airbrush https://example.com/photo.jpg dreamAnime
Available Styles:
dreamAnime
cartoon
ghibby
toon
cleanLine
`)
  }
  let imageUrl = args[0]
  let style = args[1] || "dreamAnime"
  await m.reply("⏳ جارٍ المعالجة your image... يرجى الانتظار.")
  try {
    const api = new Airbrush()
    const result = await api.generate({
      image: imageUrl,
      mode: "anime",
      style
    })
    await conn.sendFile(m.chat, result, "result.jpg", "✅ Here is your AI generated image!", m)
  } catch (e) {
    m.reply("❌ فشل to process image.\n" + e.message)
  }
}
handler.help = ['airbrush']
handler.tags = ['editor']
handler.command = ['airbrush']
handler.limit = true
export default handler