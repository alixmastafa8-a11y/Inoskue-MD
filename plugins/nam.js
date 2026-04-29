// nam.js - أمر نام وأفق للبوت

let handler = async (m, { conn, command, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, '👑 هذا الأمر للمالك فقط', m)
  
  let settings = global.db.data.settings[conn.user.jid] || {}
  
  if (command === 'نام') {
    if (settings.self === true) return conn.reply(m.chat, '😴 البوت بالفعل في وضع النوم', m)
    settings.self = true
    conn.reply(m.chat, '😴 *نام البوت*\n\nلن يستجيب لأي شخص حتى تقول *أفق*', m)
  } else if (command === 'أفق') {
    if (!settings.self) return conn.reply(m.chat, '🤖 البوت مستيقظ بالفعل', m)
    settings.self = false
    conn.reply(m.chat, '🤖 *أفاق البوت*\n\nعاد للاستجابة للجميع', m)
  }
}

handler.help = ['نام', 'أفق']
handler.command = /^(نام|أفق)$/i
handler.tags = ['owner']
handler.owner = true

export default handler
