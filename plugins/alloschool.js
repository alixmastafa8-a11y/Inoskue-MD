import axios from 'axios';
import cheerio from 'cheerio';
import baileys from '@adiwajshing/baileys';
const { proto, generateWAMessageFromContent } = baileys;
async function response(jid, data, quoted) {
    let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({ text: data.body }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: data.footer }),
                    header: proto.Message.InteractiveMessage.Header.create({ title: data.title }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({ title: '📌 اضغط لاختيار الفرض أو الدرس', sections: data.sections })
                        }]
                    })
                })
            }
        }
    }, { quoted });
    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
}
let handler = async (m, { conn, args, command }) => {
    let text;
    if (args.length >= 1) {
        text = args.join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else {
        throw "📚 هذا الأمر مخصص للبحث عن الفروض والدروس والامتحانات من موقع **Alloschool**.\n📝 مثال:\n`.alloschool Antigone`\nثم اختيار الرابط وكتابة:\n`.alloschoolget (الرابط)`\n🎉 استمتع بالدراسة!";
    }
    await m.reply("⏳ جارٍ البحث، يُرجى الانتظار...");
    if (command === "alloschoolget") {
        try {
            let res = await getAlloschool(text);
            if (!res.length) return m.reply("❌ لم يتم العثور على ملفات.");
            await conn.sendFile(m.chat, res[0].url, res[0].title, "", m, false, { asDocument: true });
        } catch (e) {
            console.error(e);
            throw '❌ حدث خطأ أثناء تحميل الملف، يرجى المحاولة لاحقًا.';
        }
    } else {
        try {
            let res = await searchAlloschool(text);
            if (!res.length) return m.reply("❌ لم يتم العثور على نتائج.");
            let sections = [{
                title: '📚 نتائج البحث من Alloschool',
                rows: res.map(item => ({
                    title: item.title,
                    description: "📌 اضغط للحصول على الرابط",
                    id: `.alloschoolget ${item.url}`
                }))
            }];
            let message = {
                title: "🔍 نتائج البحث",
                body: "🔽 اختر الفرض أو الدرس من القائمة أدناه:",
                footer: "المصدر: Alloschool",
                sections
            };
            await response(m.chat, message, m);
        } catch (e) {
            console.error(e);
            throw '❌ حدث خطأ أثناء البحث، يرجى المحاولة لاحقًا.';
        }
    }
};
handler.help = ["alloschool"];
handler.tags = ["morocco"];
handler.command = /^alloschool|getalloschool$/i;
export default handler;
async function searchAlloschool(query) {
    try {
        const response = await axios.get('https://www.alloschool.com/search?q=' + encodeURIComponent(query));
        const $ = cheerio.load(response.data);
        const results = [];
        $('ul.list-unstyled li').each((_, el) => {
            let title = $(el).find('a').text().trim();
            let url = $(el).find('a').attr('href');
            if (/^https?:\/\/www\.alloschool\.com\/element\/\d+$/.test(url)) {
                results.push({ title, url });
            }
        });
        return results.slice(0, 10); 
    } catch (error) {
        console.error(error);
        return [];
    }
}
async function getAlloschool(url) {
    try {
        const pdfRegex = /\.pdf$/i;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const files = [];
        $('a').each((_, link) => {
            const href = $(link).attr('href');
            const title = $(link).text().trim();
            if (pdfRegex.test(href)) {
                files.push({ title, url: href });
            }
        });
        return files;
    } catch (error) {
        console.error(error);
        return [];
    }
        }