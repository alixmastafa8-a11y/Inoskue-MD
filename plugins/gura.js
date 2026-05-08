import WebSocket from "ws"
import fs from "fs"
function generateRandomLetters(length = 6) {
  let result = ""
  const charCode = 26
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * charCode)
    const char = String.fromCharCode("a".charCodeAt(0) + random)
    result += char
  }
  return result
}
async function Gura(audioBuffer) {
  return new Promise(async (resolve, reject) => {
    const filename = Math.floor(Math.random() * 1e17) + generateRandomLetters() + ".mp4"
    const result = {}
    const sessionHash = {
      fn_index: 2,
      session_hash: "xyuk2cf684b"
    }
    const data = {
      fn_index: 2,
      data: [{
        data: "data:audio/mpeg;base64," + audioBuffer.toString("base64"),
        name: filename
      }, 0, "pm", 0.5, false, "", "en-US-AnaNeural-Female"],
      event_data: null,
      session_hash: "xyuk2cf684b"
    }
    const ws = new WebSocket("wss://yanzbotz-waifu-yanzbotz.hf.space/queue/join")
    ws.onopen = () => {
      console.log("تـم الاتصال بـ WebSocket")
    }
    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      switch (message.msg) {
        case "send_hash":
          ws.send(JSON.stringify(sessionHash))
          break
        case "send_data":
          console.log("يتم الآن معالجة الصوت...")
          ws.send(JSON.stringify(data))
          break
        case "process_completed":
          result.url = "https://yanzbotz-waifu-yanzbotz.hf.space/file=" + message.output.data[1].name
          break
      }
    }
    ws.onclose = (event) => {
      if (event.code === 1000) {
        console.log("العملية تمت بنجاح")
        resolve(result)
      } else {
        reject("خطأ في الاتصال بـ WebSocket")
      }
    }
  })
}
let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('audio'))
    return m.reply('المرجو الرد على رسالة صوتية!')
  const audioBuffer = await m.quoted.download()
  let result = await Gura(audioBuffer)
  if (!result.url) return m.reply("فشل فـي تحويل الصوت لفيديو.")
  await conn.sendFile(m.chat, result.url, 'output.mp4', 'هاهو الفيديو ديالك:', m)
}
handler.help = ['gura']
handler.tags = ['ai']
handler.command = ['gura']
handler.limit = true 
export default handler