import yts from 'yt-search'
import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `╭─── 「 **بـحـث يـوتـيـوب** 」 ───⚔️\n│\n│ 🔍 *يرجى كتابة ما تريد البحث عنه.*\n│\n│ *مثال:*\n│ ${usedPrefix || '.'}${command || 'yts'} سورة الكهف\n│\n╰──────────────────• 🐗`
  
  await conn.reply(m.chat, global.wait, m)
  
  let results = await yts(text)
  let tes = results.all
  let teks = results.all.map(v => {
    switch (v.type) {
      case 'video': return `🎬 *_${v.title}_*\n🔗 *_الرابط :_* ${v.url}\n🕒 *_المدة :_* ${v.timestamp}\n📅 *_منذ :_* ${v.ago}\n👁 *_المشاهدات :_* ${v.views}`
    }
  }).filter(v => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n')
  
  let finalCaption = `╭─── 「 **نـتـائـج الـبـحـث** 」 ───⚔️\n\n${teks}\n\n╰──────────────────• 🐗`
  
  conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', finalCaption, m)
}

handler.help = ['yts'] 
handler.tags = ['search']
handler.command = ['yts', 'ytsearch', 'بحث', 'يوتيوب'] 
handler.limit = 1

export default handler
