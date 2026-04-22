import axios from "axios";
import ws from "ws";
import * as cheerio from "cheerio";
export async function twitter(url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!/x.com\/.*?\/status/gi.test(url))
                throw new Error(`رابط غير صالح! Make sure you're using the correct X (Twitter) link.\n التحميل من منصة x تويتر سابقا يا عزيزي `);
            const base_url = "https://x2twitter.com";
            const base_headers = {
                accept: "*/*",
                "accept-language": "en-EN,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest",
                Referer: "https://x2twitter.com/en",
            };
            const token = await axios
                .post(`${base_url}/api/userverify`, { url }, { headers: base_headers })
                .then((v) => v.data.token || "")
                .catch(() => { throw new Error("فشل to get token."); });
            let r = await axios
                .post(`${base_url}/api/ajaxSearch`, new URLSearchParams({ q: url, lang: "id", cftoken: token }).toString(), { headers: base_headers })
                .then((v) => v.data)
                .catch(() => { throw new Error("فشل to get data from X."); });
            if (r.status !== "ok") throw new Error(`فشل to get data because ${r}`);
            const $ = cheerio.load(r.data.replace('"', '"'));
            let type = $("div").eq(0).attr("class");
            type = type.includes("tw-video") ? "video"
                : type.includes("video-data") && $(".photo-list").length ? "image"
                : "hybrid";
            let d = {};
            if (type === "video") {
                d = {
                    type,
                    download: $(".dl-action p").map((i, el) => {
                        let name = $(el).text().trim();
                        let fileType = name.includes("MP4") ? "mp4" : null;
                        let reso = fileType === "mp4" ? name.split(" ").pop().replace(//, "") : null;
                        return {
                            type: fileType,
                            reso,
                            url: $(el).find("a").attr("href"),
                        };
                    }).get(),
                };
            } else if (type === "image") {
                d = {
                    type,
                    download: $("ul.download-box li").map((i, el) => {
                        return {
                            type: "image",
                            url: $(el).find("a").attr("href"),
                        };
                    }).get(),
                };
            } else {
                d = { type, download: [] };
            }
            return resolve(d);
        } catch (e) {
            return reject(`خطأ: ${e.message}`);
        }
    });
}
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Where's the URL? x (Twitter)");
    try {
        let result = await twitter(text);
        if (result.type === "video") {
            let video1024p = result.download.find(v => v.type === "mp4" && v.reso === "1024p");
            let selectedVideo = video1024p || result.download.find(v => v.type === "mp4");
            if (!selectedVideo) return conn.sendMessage(m.chat, { ملصق: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
            await conn.sendMessage(m.chat, { video: { url: selectedVideo.url } });
            conn.sendMessage(m.chat, { ملصق: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        } else if (result.type === "image") {
            let selectedImage = result.download[0]; 
            if (!selectedImage) return conn.sendMessage(m.chat, { ملصق: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
            await conn.sendMessage(m.chat, { image: { url: selectedImage.url } });
            conn.sendMessage(m.chat, { ملصق: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        } else {
            conn.sendMessage(m.chat, { ملصق: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        }
    } catch (e) {
        conn.sendMessage(m.chat, { ملصق: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        m.reply(`❌ حدث خطأ:\n${e}`);
    }
};
handler.help = ['منصة-اكس'];
handler.tags = ['downloader'];
handler.command = ['منصة-اكس'];
handler.limit = true;
export default handler;