import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let handler = async (m, { conn, text, command }) => {
  if (!text && command === "ncs") {
    let guide = `
🎧 *NCS Feature Guide*
With this feature, you can search and download free music from *NoCopyrightSounds (NCS)* 🎵  
🔹 *Step 1: Search for a song*
Type:
\`\`\`
.ncs Alan Walker
\`\`\`
Then the bot will show something like this:
\`\`\`
🎶 Dreamer by Alan Walker
🆔 ID: af3e020d-b90d-439a-9106-76eb863784eb
🎧 Preview: https://ncs.io/preview/12345
\`\`\`
🔹 *Step 2: Download the song*
Copy the ID and type:
\`\`\`
.ncsdl af3e020d-b90d-439a-9106-76eb863784eb
\`\`\`
The bot will send you:
🎵 Song info  
⬇️ Direct MP3 download  
📋 NCS copyright text  
Enjoy free copyright-safe music ❤️
مثال:
\`\`\`
.ncs Alan Walker
\`\`\`
`;
    return conn.reply(m.chat, guide, m);
  }
  if (command === "ncs" && text) {
    await m.reply("⏳ يرجى الانتظار a moment while I search for NCS tracks...");
    try {
      const url = `https://ncs.io/music-search?q=${encodeURIComponent(text)}`;
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const $ = cheerio.load(data);
      const results = [];
      $("table.tablesorter tbody tr").each((_, el) => {
        const $row = $(el);
        const $play = $row.find(".player-play");
        const tid = $play.attr("data-tid") || "";
        const title = $play.attr("data-track") || "";
        const artist = $play.attr("data-artistraw") || "";
        const image = $row.find("td img[alt]").attr("src") || "";
        const previewUrl = $play.attr("data-url") || "";
        const releaseDate = $row.find("td:nth-child(6)").text().trim();
        if (tid && title) {
          results.push({ tid, title, artist, image, previewUrl, releaseDate });
        }
      });
      if (!results.length) return m.reply("❌ No tracks found for that كلمة البحث.");
      let message = "🎵 *NCS Search Results:*\n\n";
      for (let i = 0; i < Math.min(results.length, 5); i++) {
        const t = results[i];
        message += `🎶 *${t.title}* by ${t.artist}\n🆔 ID: ${t.tid}\n📅 ${t.releaseDate}\n🎧 Preview: ${t.previewUrl}\n\n`;
      }
      message += `To download a track, use: *.ncsdl <track_id>*`;
      await conn.sendFile(m.chat, results[0].image, "ncs.jpg", message, m);
    } catch (err) {
      console.error(err);
      m.reply("❌ فشل to fetch NCS results. Please try again later.");
    }
  }
  if (command === "ncsdl") {
    if (!text) return m.reply("يرجى تقديم a track ID.\nمثال: *.ncsdl af3e020d-b90d-439a-9106-76eb863784eb*");
    await m.reply("⏳ Fetching track information and downloading the MP3...");
    try {
      const baseUrl = "https://ncs.io";
      const { data } = await axios.get(`${baseUrl}/track/info/${text}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": `${baseUrl}/music-search`,
        },
      });
      const $ = cheerio.load(data);
      const info = {
        tid: text,
        title: "",
        artist: "",
        genre: "",
        version: "",
        downloadUrl: "",
        imageUrl: "",
        copyText: "",
      };
      const $h5 = $("h5");
      if ($h5.length) {
        info.title = $h5.contents().first().text().trim();
        info.artist = $h5.find("span").text().trim();
      }
      const $btn = $("a.btn.black[href*='/track/download/']");
      if ($btn.length) {
        info.genre = $btn.attr("data-genre") || "";
        info.version = $btn.attr("data-version") || "";
        info.downloadUrl = `${baseUrl}${$btn.attr("href")}`;
      }
      const style = $(".cover .img").attr("style") || "";
      const match = style.match(/url\\('([^']+)'\\)/);
      if (match) info.imageUrl = match[1];
      info.copyText = $("#panel-copy").text().trim();
      if (!info.downloadUrl) return m.reply("❌ Track غير موجود or missing download link.");
      const filePath = path.join(__dirname, `${info.title || "track"}.mp3`);
      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: info.downloadUrl,
        method: "GET",
        responseType: "stream",
      });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      const caption = `🎵 *${info.title}*\n👤 Artist: ${info.artist}\n🎧 Genre: ${info.genre}\n📀 Version: ${info.version}\n\n⬇️ *Download Link:*\n${info.downloadUrl}\n\n📋 *Copy Text:*\n${info.copyText}`;
      await conn.sendFile(m.chat, filePath, `${info.title}.mp3`, caption, m);
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(err);
      m.reply("❌ فشل to get track info or download file. Please check the ID and try again.");
    }
  }
};
handler.help = ["ncs", "ncsdl"];
handler.tags = ["downloader"];
handler.command = ["ncs", "ncsdl"];
handler.limit = true;
export default handler;