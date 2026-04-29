import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return m.reply('👑 هذا الأمر للمالك فقط')

  if (!text || !text.includes('|')) return m.reply(`✳️ *الاستخدام:*\n\`\`\`.بدل old_text|new_text\`\`\`\nاستبدال فوري في جميع ملفات plugins`)

  let parts = text.split('|')
  if (parts.length < 2) return m.reply('❌ يجب الفصل بين النص القديم والجديد بعلامة |')

  let oldText = parts[0]
  let newText = parts.slice(1).join('|') || ''

  let pluginsDir = path.join(process.cwd(), 'plugins')
  if (!fs.existsSync(pluginsDir)) return m.reply('❌ مجلد plugins غير موجود')

  let files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
  if (files.length === 0) return m.reply('❌ لا توجد ملفات في مجلد plugins')

  let modified = []
  for (let file of files) {
    let filePath = path.join(pluginsDir, file)
    let content = fs.readFileSync(filePath, 'utf8')
    if (content.includes(oldText)) {
      let newContent = content.replaceAll(oldText, newText)
      fs.writeFileSync(filePath, newContent, 'utf8')
      modified.push(file)
    }
  }

  if (modified.length === 0) return m.reply(`❌ لم يتم العثور على "${oldText}" في أي ملف`)
  return m.reply(`✅ *تم الاستبدال*\n📂 ${modified.length} ملف:\n${modified.join('\n')}`)
}

handler.help = ['بدل2']
handler.tags = ['owner']
handler.command = /^(بدل2|replace)$/i
handler.owner = true

export default handler
