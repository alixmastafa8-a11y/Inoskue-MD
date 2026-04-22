import fetch from 'node-fetch'
import { ملصق } from '../lib/ملصق.js'
import uploadImage from '../lib/uploadImage.js'
let handler = async (m, { conn, args, text, usedPrefix, command }) => {
let input = ` *exemple*
${usedPrefix + command} silana bot`
let teks = m.quoted ? m.quoted.text : text
	if (!teks) return m.reply(input)
	let stiker = false
			const avatar = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
    const displayName = conn.getName(m.sender)
    const username = m.sender.split('@')[0];
    const replies = '639';
    const retweets = '186';
    const theme = 'dark'; 
    const url = `https://some-random-api.com/canvas/misc/tweet?displayname=${encodeURIComponent(displayName)}&username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}&comment=${encodeURIComponent(text)}&replies=${encodeURIComponent(replies)}&retweets=${encodeURIComponent(retweets)}&theme=${encodeURIComponent(theme)}`;
		stiker = await ملصق(false, url, packname, author)
conn.sendFile(m.chat, stiker, 's.webp', m)
}
handler.help = ['tweetmaker_ملصق']
handler.tags = ['ملصق']
handler.command = /^(tweetmaker_ملصق)$/i
handler.limit = true 
export default handler