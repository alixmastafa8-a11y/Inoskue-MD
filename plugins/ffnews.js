import axios from "axios";
import cheerio from "cheerio";
let handler = async (m, { conn }) => {
    try {
        const baseurl = "https://www.freefiremania.com.br/";
        const resp = await axios.get("https://www.freefiremania.com.br/free-fire-new-update.html");
        const $ = cheerio.load(resp.data);
        let result = [];
        $(".col-12.col-lg-4").each((a, b) => {
            const title = $(b).find("a").attr("title");
            const desc = $(b).find("small").text();
            const url = baseurl + $(b).find("a").attr("href");
            result.push({ title, desc, url });
        });
        if (result.length === 0) return m.reply("لم يتم العثور على أي أخبار جديدة اليوم.");
        let message = "*📢 أحدث أخبار Free Fire:*\n\n";
        result.forEach((item, index) => {
            message += `*${index + 1}. ${item.title}*\nالوصف: ${item.desc}\n🔗 الرابط: ${item.url}\n\n`;
        });
        await conn.sendMessage(m.chat, { text: message }, { quoted: m });
    } catch (err) {
        console.error(err);
        m.reply("❌ حدث خطأ أثناء جلب الأخبار، حاول مرة أخرى لاحقاً.");
    }
};
handler.help = ["ffnews"];
handler.tags = ["search"];
handler.command = ["ffnews"];
handler.limit = true;
export default handler;