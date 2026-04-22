import fetch from "node-fetch";
const handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`*• مثال :* ${usedPrefix + command} *[رابط جوجل درايف]*`);
    m.reply("المرجو الانتظار قليلا لا تنسى ان تتابع \ninstagram.com/noureddine_ouafy");
    let data = await drive(text);
    if (data.error) return m.reply("⚠️ حدث خطأ أو أن الرابط غير صالح!");
    let cap = `┌─⭓「 *DRIVE DOWNLOADER* 」
│ *• اسم الملف :* ${data.fileName}
│ *• حجم الملف :* ${data.fileSize}
│ *• نوع الملف :* ${data.mimetype}
└────────⭓`;
    await conn.sendMessage(m.chat, {
        document: { url: data.downloadUrl },
        fileName: data.fileName,
        mimetype: data.mimetype,
        caption: cap
    }, { quoted: m });
};
async function drive(url) {
    let id, res = { error: true };
    if (!url || !url.match(/drive\.google/i)) return res;
    try {
        id = (url.match(/\/?id=([^&]+)/i) || url.match(/\/d\/(.*?)\
        if (!id) throw "⚠️ لم يتم العثور على ID الملف!";
        let response = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
                "x-client-data": "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
                "x-drive-first-party": "DriveWebUi",
                "x-json-requested": "true"
            }
        });
        let { fileName, sizeBytes, downloadUrl } = JSON.parse((await response.text()).slice(4));
        if (!downloadUrl) throw "⚠️ لا يمكن تحميل الملف، قد يكون الرابط محدود!";
        let fileData = await fetch(downloadUrl);
        if (fileData.status !== 200) throw fileData.statusText;
        return {
            downloadUrl,
            fileName,
            fileSize: formatSize(sizeBytes),
            mimetype: fileData.headers.get("content-type")
        };
    } catch (e) {
        console.error(e);
        return res;
    }
}
function formatSize(bytes) {
    if (bytes === 0) return "0 B";
    let k = 1024,
        sizes = ["B", "KB", "MB", "GB", "TB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}
handler.help = ['درايف'];
handler.tags = ["downloader"];
handler.command = ['درايف'];
export default handler;