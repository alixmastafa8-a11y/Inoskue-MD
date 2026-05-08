// https://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V
let before = async function (m, { conn, isAdmin, isBotAdmin }) {
  // Regex for WhatsApp channels and groups
  const regex = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+|https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]{22}/

  if (regex.test(m.text)) {
    if (isAdmin) return // Ignore if the sender is an admin
    if (!isBotAdmin) return // Bot must be admin to delete or remove

    // Send warning message
    await conn.sendMessage(
      m.chat,
      {
        text: `⚠️ *تم اكتشاف رابط قناة أو مجموعة!*\n\nالعضو *@${m.sender.split('@')[0]}* تم طرده لأنه خالف قوانين المجموعة وقام بإرسال روابط.\n\n🚫 هذا التصرف ممنوع تمامًا.`,
        mentions: [m.sender]
      },
      { quoted: m }
    )

    // Delete the message containing the link
    await conn.sendMessage(m.chat, { delete: m.key })

    // Kick the user who sent the link
    await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
  }
}

export default { before }
