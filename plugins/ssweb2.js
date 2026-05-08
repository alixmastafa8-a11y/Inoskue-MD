let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `**طريقة الاستخدام:** ${usedPrefix}${command} <url>\n\n*مثال:*\n${usedPrefix}${command} https://www.google.com`, m);
    }
    let url;
    try {
        url = new URL(text.startsWith('http') ? text : `https://${text}`);
    } catch (e) {
        return conn.reply(m.chat, '*رابط غير صالح format.* Please make sure the link is correct.', m);
    }
    async function ssweb(targetUrl) {
        const payload = {
            tkn: 125,
            d: 3000,
            u: encodeURIComponent(targetUrl),
            fs: 0,
            w: 1280, 
            h: 720,  
            s: 100,
            z: 100,
            f: "png", 
            rt: "jweb"
        }
        const r = await fetch("https://api.pikwy.com/?" + new URLSearchParams(payload));
        if (!r.ok) throw new Error(`${r.status} ${r.statusText} | ${await r.text()}`);
        return await r.json();
    }
    try {
        await conn.reply(m.chat, '*Generating screenshot... please wait.*', m);
        const result = await ssweb(url.href);
        if (result.iurl) {
            await conn.sendFile(
                m.chat, 
                result.iurl, 
                'screenshot.png', 
                `✅ *Screenshot for:* ${url.hostname}\n\n*Captured on:* ${result.date}`, 
                m
            );
        } else {
            await conn.reply(m.chat, `❌ *فشل to retrieve image URL.* \nAPI Response: ${JSON.stringify(result, null, 2)}`, m);
        }
    } catch (e) {
        console.error('SSWEB Error:', e);
        await conn.reply(m.chat, `*حدث خطأ while processing the request:*\n\n${e.message}`, m);
    }
}
handler.help = ['ssweb2'];
handler.command = ['ssweb2'];
handler.tags = ['tools']; 
handler.limit = true;
export default handler;