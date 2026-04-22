let handler = async (m, { conn, args }) => {
  let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat
  try {
    const data = conn.chats[id].messages
    const online = Object.values(data).map(item => item.key.participant)
    const uniqueOnline = online.filter((value, index, self) => self.indexOf(value) === index)
    let message = `┌─〔 Online Users / الأعضاء المتصلين 〕\n` +
      uniqueOnline.map(v => '├ @' + v.replace(/@.+/, '')).join('\n') +
      '\n└────'
    conn.reply(m.chat, message, m, {
      contextInfo: { mentionedJid: uniqueOnline }
    })
  } catch (e) {
    m.reply('No users found or something went wrong.')
  }
}
handler.help = ['متصلون']
handler.tags = ['owner']
handler.command = /^(listonline)/i
handler.owner = true
handler.group = true
handler.admin = true
handler.fail = null
export default handler