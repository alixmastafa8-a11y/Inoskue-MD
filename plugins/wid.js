let handler = async (m, { conn, text, participants, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '⛔ هذا الأمر يعمل في المجموعات فقط', m)
  if (!isAdmin && !isOwner) return conn.reply(m.chat, '👑 هذا الأمر للمشرفين فقط', m)

  let q = text ? text : '🔔 تنبيه للجميع'
  let mentions = participants.map(a => a.id)
  let teks = `*${q}*\n\n` + participants.map((a, i) => `\t\t*${i + 1}.*\t@${a.id.split('@')[0]}`).join('\n')

  await conn.sendMessage(m.chat, {
    text: teks,
    mentions: mentions
  }, { quoted: m })
}

handler.help = ['منشن', 'tagall']
handler.tags = ['group']
handler.command = /^(منشن|tagall|everyone)$/i
handler.group = true
handler.admin = true

export default handler
