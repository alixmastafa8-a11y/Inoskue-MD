import fs from 'fs'
const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('يرجى إدخال the file name!')
  if (!m.quoted?.text) return m.reply('Reply to the file code!')
  fs.writeFileSync(text, m.quoted.text)
  m.reply(`نجحfully added the file "${text}"!`)
}
handler.command = /^(savefile)$/i
handler.help = ['savefile']
handler.tags = ['owner']
handler.owner = true
export default handler