let handler = async (m, { conn, text }) => {
    if (!text && !m.quoted) return m.reply("يرجى تقديم a valid channel link.");
    if (!text.includes("https://whatsapp.com/channel/") && !m.quoted.text.includes("https://whatsapp.com/channel/")) {
        return m.reply("Invalid link.");
    }
    let result = m.quoted ? m.quoted.text.split('https://whatsapp.com/channel/')[1] : text.split('https://whatsapp.com/channel/')[1];
    let res = await conn.newsletterMetadata("invite", result);
    await conn.newsletterFollow(res.id);
    m.reply(`
نجحfully joined the WhatsApp channel ✅
Channel Name: ${res.name}
Total Followers: ${res.subscribers + 1}
    `);
};
handler.help = ['joinchannel'];
handler.tags = ['owner'];
handler.command = /^(joinchannel)$/i;
handler.owner = true;
export default handler;