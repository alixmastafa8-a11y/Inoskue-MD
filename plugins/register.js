import { createHash } from 'crypto'
import fetch from 'node-fetch'
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { text, usedPrefix, command }) {
let namae = conn.getName(m.sender)
let user = global.db.data.users[m.sender]
const pp = await conn.profilePictureUrl(m.sender, "image").catch((_) => "https://telegra.ph/file/ee60957d56941b8fdd221.jpg")
  if (user.registered === true) throw `You Have Already Registered In The Database, Do You Want To Re-Register? *${usedPrefix}unreg*`
  if (!Reg.test(text)) return m.reply(`Enter your name and age\nمثال: .daftar Noureddine.17`)
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw 'Name Cannot Be Empty'
  if (!age) throw 'Age Cant Be Blank'
  age = parseInt(age)
  if (age > 30) throw 'This is the beginning of the day -_-'
  if (age < 5) throw 'Too small ;!'
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  let sn = createHash('md5').update(m.sender).digest('hex')
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.fromMe ? conn.user.jid : m.sender
  let cap = `
╭━━「 *Information*
│• *Name:* ${name}
│• *Age:* ${age} Years
│• *Status:* _نجح_
│• *Serial Number:* ${sn}
╰╾•••
`
await conn.sendMessage(m.chat, { text: cap,
contextInfo:
					{
						"externalAdReply": {
							"title": " ✔️ S U C C E S S  R E G I S T E T",
							"body": "",
							"showAdAttribution": true,
							"mediaType": 1,
							"sourceUrl": '',
							"thumbnailUrl": pp,
							"renderLargerThumbnail": true
						}
					}}, m)
}
handler.help = [ 'register']
handler.tags = ['infobot']
handler.command = /^(daftar|verify|reg(ister)?)$/i
export default handler
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}