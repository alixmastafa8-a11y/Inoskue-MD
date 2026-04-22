let handler = async (m, { conn, text }) => {
   if (!text) return m.reply('_Enter Group Name!_')
   try{
    m.reply(wait)
    let group = await conn.groupCreate(text, [m.sender])
    let link = await conn.groupInviteCode(group.gid)
    let url = 'https://chat.whatsapp.com/' + link;
    m.reply('_نجحfully Created Group *' + text + '*_\n\n*Name:* ' + text + '\n*ID:* ' + group.gid + '\n*Link:* ' + url)
       } catch (e) {
    m.reply(`Error`)
  }
}
handler.help = ['انشاء-مجموعة']
handler.tags = ['owner']
handler.command = /^(creategroup)$/
handler.owner = true
export default handler