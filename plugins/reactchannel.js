let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw ("يرجى إدخال a WhatsApp channel link in the correct format. exemple :\n\n*.reactchannel* https://whatsapp.com/channel/0029VaX4b6J7DAWqt3Hhu01A/475");
  const match = text.match(/https:\/\/whatsapp\.com\/channel\/(\w+)(?:\/(\d+))?/);
  if (!match) throw ("رابط غير صالح. Please double-check.");
  const channelId = match[1];
  const chatId = match[2];
  if (!chatId) throw ("Chat ID غير موجود in the provided link.");
  const defaultChannelId = "YOU WHATSAPP CHANNEL ID 🤗😅";
  conn.newsletterMetadata("invite", channelId || defaultChannelId).then(data => {
    if (!data) throw ("Newsletter غير موجود or an error occurred.");
    conn.newsletterReactMessage(data.id, chatId, text.split(" ").slice(1).join(" ") || "😋✅🤣🥳🤣🔥🤣🔥🤣");
  });
  m.reply("نجح");
}
handler.help = ['reactchannel'];
handler.command = ['reactchannel'];
handler.tags = ['owner'];
handler.owner = true
export default handler;