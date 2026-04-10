import axios from 'axios';

let handler = async (m, { conn, text, command, usedPrefix }) => {
    
    // منع الرد بدون بادئة
    if (!m.text.startsWith('.') && 
        !m.text.startsWith('/') && 
        !m.text.startsWith('!') && 
        !m.text.startsWith('#')) {
        return;
    }

    if (!text) {
        await conn.sendMessage(m.chat, {
            text: `*🔍 يرجى كتابة اسم التطبيق للبحث عنه.*\n\n*مثال:*\n${usedPrefix + command} Facebook`
        }, { quoted: m });
        return; 
    }

    try {
        // تفاعل البدء
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

        const apiUrl = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(text)}&limit=1`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
            await conn.sendMessage(m.chat, {
                text: "❌ *لم يتم العثور على أي نتائج، تأكد من اسم التطبيق.*"
            }, { quoted: m });
            return; 
        }

        const app = data.datalist.list[0];
        const sizeMB = (app.size / (1024 * 1024)).toFixed(2);

        const caption = `
╭─── 「 **تـحـمـيـل الـتـطـبـيـق** 」 ───⚔️
│
│ 🎮 **الاسم:** ${app.name}
│ 📦 **الحزمة:** ${app.package}
│ 📅 **آخر تحديث:** ${app.updated}
│ 📁 **الحجم:** ${sizeMB} ميجابايت
│
╰──────────────────• 🐗`.trim();

        // 1️⃣ إرسال صورة التطبيق أولاً (بشكل منفصل وواضح)
        await conn.sendMessage(m.chat, {
            image: { url: app.icon },
            caption: `🖼️ **صورة التطبيق:**\n*${app.name}*`,
        }, { quoted: m });

        // تفاعل التحميل
        await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

        // 2️⃣ إرسال ملف الـ APK
        await conn.sendMessage(m.chat, {
            document: { url: app.file.path_alt || app.file.path },
            fileName: `${app.name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: app.name,
                    body: "Inosuke Bot 🐗",
                    mediaType: 1,
                    sourceUrl: app.file.path_alt || app.file.path,
                    thumbnailUrl: app.icon,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            } 
        }, { quoted: m });

        // تفاعل النجاح
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { 
            text: `❌ حدث خطأ أثناء تحميل التطبيق:\n${e.message}` 
        }, { quoted: m });
    }
}

handler.help = ['apk2'];
handler.command = ['apk2', 'تطبيق2', 'برنامج2']; 
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
