let handler = async (m, {conn, 
text,
args,
usedPrefix, 
command,
participants
}) => {
  let who = m.mentionedJid[0] 
if (!who) return conn.sendMessage(m.chat, {text: `تاق أو رد على الشخص you want to do ${command} !`, mentions: participants.map(a => a.id)}, {quoted: m})
let user = db.data.users[who]
if (user.warn == undefined) user.warn = 0
if (user.warn >= 4) {
 conn.groupParticipantsUpdate(m.chat, [who], 'remove').then(_ =>{
 conn.reply(m.chat, '📣 *سيتم إزالتك من المجموعة لأن إجمالي إنذارك وصل إلى 5 نقاط* ❗', m)
 user.warn = 0
  })
} else {
if (command == 'warn') {
user.warn += 1
conn.reply(m.chat, `*تمت إضافة تحذير to ${await conn.getName(who.split(`@`)[0] + '@s.whatsapp.net') || who.split(`@`)[0]}* •> ${user.warn}/5`, m, {mentions: participants.map(a => a.id)})
} else if (command == 'unwarn') {
user.warn -= 1
conn.reply(m.chat, `*تم تقليل التحذيرات ${await conn.getName(who.split(`@`)[0] + '@s.whatsapp.net') || who.split(`@`)[0]}* •> ${user.warn}/5`, m, {mentions: participants.map(a => a.id)})
}
}
}
handler.help = ['تحذير']
handler.tags = ['owner']
handler.command = /^(unwarn|warn)$/i
handler.admin = true
handler.group = true
handler.owner = true
export default handler