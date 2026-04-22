let handler = async (m, { conn, text }) => {
if (!text) throw 'exemple : \n *.ytcomment* noureddine ouafy '
conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/misc/youtube-comment', {
avatar: await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
comment: text,
username: conn.getName(m.sender)
}), 'error.png', '*THANKS FOR COMMENT* by @noureddine ouafy', m)
}
handler.help = ['ytcomment']
handler.tags = ['tools'] 
handler.command = /^(ytcomment)$/i
handler.limit = true
export default handler