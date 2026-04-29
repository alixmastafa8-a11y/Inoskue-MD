import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, '⛔ هذا الأمر للمالك فقط', m)
  
  if (!text.includes('|')) return conn.reply(m.chat, `*طريقة الاستخدام:*\n.بدل النص_القديم|النص_الجديد\n\n*مثال:*\n.بدل 🥷🏻|❤️\n.بدل ساسكي|ناروتو`, m)
  
  let [lama, jadi] = text.split('|')
  if (!lama || jadi === undefined) return conn.reply(m.chat, '⚠️ تأكد تكتب: القديم|الجديد', m)
  
  lama = lama.trim()
  jadi = jadi.trim()
  
  await conn.reply(m.chat, `⏳ جاري البحث عن "${lama}" في ملفات plugins...`, m)
  
  let pluginsPath = './plugins'
  let files = fs.readdirSync(pluginsPath).filter(v => v.endsWith('.js'))
  let count = 0
  let changedFiles = []
  
  for (let file of files) {
    let filePath = path.join(pluginsPath, file)
    try {
      let content = fs.readFileSync(filePath, 'utf8')
      
      // تشيك واش النص كاين فالملف
      if (content.includes(lama)) {
        let newContent = content.split(lama).join(jadi)
        fs.writeFileSync(filePath, newContent, 'utf8')
        count++
        changedFiles.push(file)
      }
    } catch (e) {
      console.log(`خطأ في ${file}:`, e)
    }
  }
  
  if (count === 0) {
    await conn.reply(m.chat, `❌ ما لقيت "${lama}" في أي ملف`, m)
  } else {
    let listFiles = changedFiles.map((v, i) => `${i + 1}. ${v}`).join('\n')
    await conn.reply(m.chat, `✅ *تم الاستبدال بنجاح*\n\n📝 *النص القديم:* ${lama}\n📝 *النص الجديد:* ${jadi}\n📂 *عدد ملفات plugins:* ${count}\n\n*الملفات اللي تبدلات:*\n${listFiles}`, m)
  }
}

handler.help = ['بدل']
handler.tags = ['owner']
handler.command = /^(بدل|replace)$/i
handler.owner = true // للمالك فقط

export default handler
