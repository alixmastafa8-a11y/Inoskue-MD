import fs from 'fs'

let handler = async (m, { conn, usedPrefix }) => {
    let ownerNumber = '212680821981'
    let ownerName = 'M U S T A F A ⚔️'
    
    // إرسال بطاقة المطور (VCard)
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\nEND:VCARD`
    
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: ownerName,
            contacts: [{ vcard }]
        }
    }, { quoted: m })

    // الرسالة الفخمة الملحقة
    let ownerText = `
*╭━〔 👑 مـلـك الـنـظـام 👑 〕━╮*
*┃*
*┃* 🔱 *المطور:* ${ownerName}
*┃* 🏴 *الدولة:* الـمـغـرب 🇲🇦
*┃* ⚡ *الحالة:* متصل للسيطرة
*┃* 💠 *الرقم:* +${ownerNumber}
*┃*
*╰━━━━━━━━━━━━━━━╯*

*『 🪽 』تـواصـل مـع الـمـطـور فـقـط لـلأمـور الـضـروريـة.. إيـنـوسـكـي لا يـرحـم الـمـتـطـفـلـيـن 🛡️*

*⛓️ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝑩𝒚 𝑴𝒖𝒔𝒕𝒂𝒇𝒂 𝑴𝒐𝒓𝒐𝒄𝒄𝒐 ⛓️*
`.trim()

    await conn.sendMessage(m.chat, {
        text: ownerText,
        contextInfo: {
            externalAdReply: {
                title: "💎 OWNER INOSUKE BOT 💎",
                body: "ᴛʜᴇ ʟᴇɢᴇɴᴅ ᴏғ ᴍᴏʀᴏᴄᴄᴏ",
                // تم استبدال الملف المحلي برابط صورة لضمان عدم حدوث خطأ
                thumbnailUrl: "https://telegra.ph/file/e601537d315cbc69b856b.jpg",
                sourceUrl: `https://wa.me/${ownerNumber}`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['main']
handler.command = /^(owner|المطور|مطور)$/i

export default handler