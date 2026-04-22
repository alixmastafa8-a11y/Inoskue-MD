let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("🚨 *يرجى إدخال رابط الموقع!*");
    let domain = text.replace(/https?:\/\
    let ssUrl = `https://image.thum.io/get/width/1900/crop/1000/fullpage/https://${domain}`;
    await conn.sendMessage(m.chat, { 
        image: { url: ssUrl },
        caption: "📸 *تم التقاط لقطة الشاشة بنجاح!*"
    }, { quoted: m });
};
handler.help = ['لقطة-شاشة'];
handler.tags = ['tools'];
handler.command = /^(screenshot)$/i;
export default handler;