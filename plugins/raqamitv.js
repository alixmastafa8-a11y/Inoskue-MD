import cheerio from 'cheerio';
import fetch from 'node-fetch';
let activeChats = {};
const handler = async (m, { conn, text, command }) => {
    const userKey = m.chat + m.sender;
    if (!text) {
        return m.reply(
            `*طريقة الاستعمال:*\n\`\`\`\n.raqamitv اسم الهاتف\nقم بالرد على النتيجة برقمها للحصول على تفاصيل الخبر مكتوبة\n\`\`\`\n\n*طريقة الاستخدام:*\n\`\`\`\n.raqamitv phone name\nرد بـ the result number to get the full article text\n\`\`\``
        );
    }
    await m.reply("جاري البحث عن النتائج، المرجو الانتظار...");
    try {
        let res = await fetchAndParseData(text);
        let teks = 
`*طريقة الاستعمال:*\n\`\`\`\n.raqamitv اسم الهاتف\nقم بالرد على النتيجة برقمها للحصول على تفاصيل الخبر مكتوبة\n\`\`\`\n\n` +
        res.map((item, index) => {
            return `النتيجة رقم ${index + 1}\nالعنوان: ${item.title}\n↳ للوصل إلى تفاصيل الخبر، قم بالرد على هذه الرسالة برقم *${index + 1}*`;
        }).filter(v => v).join("\n\n");
        await conn.sendMessage(m.chat, { text: teks }, { quoted: m });
        activeChats[userKey] = { res, optionsSent: true };
    } catch (e) {
        await m.reply('حدث خطأ أثناء البحث. حاول مرة أخرى لاحقًا.');
    }
};
const responseHandler = async (m, { conn }) => {
    const userKey = m.chat + m.sender;
    if (activeChats[userKey] && activeChats[userKey].optionsSent) {
        const choice = parseInt(m.text.trim());
        const { res } = activeChats[userKey];
        delete activeChats[userKey];
        if (choice > 0 && choice <= res.length) {
            try {
                let obje = await fetchContentFromLink(res[choice - 1].link);
                await m.reply(obje);
            } catch (e) {
                await m.reply('حدث خطأ أثناء جلب تفاصيل المحتوى.');
            }
        } else {
            m.reply("رقم النتيجة غير صحيح. يرجى المحاولة مجددًا.");
        }
    }
};
handler.before = responseHandler;
handler.command = /^(raqamitv)$/i;
handler.help = ['raqamitv'];
handler.tags = ['search'];
handler.limit = true 
export default handler;
async function fetchAndParseData(q) {
    try {
        const response = await fetch('https://raqamitv.com/?s=' + q);
        const html = await response.text();
        const $ = cheerio.load(html);
        const posts = $('.post-item').map((index, element) => {
            const title = $(element).find('.post-title a').text();
            const link = $(element).find('.post-title a').attr('href');
            return { title, link };
        }).get();
        return posts;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
async function fetchContentFromLink(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const allContent = [];
        $('p').each((index, element) => {
            const paragraphText = $(element).text();
            if (paragraphText) {
                allContent.push(paragraphText);
            }
        });
        return allContent.join('\n\n');
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}