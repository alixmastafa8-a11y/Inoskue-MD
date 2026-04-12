import axios from 'axios';
import cheerio from 'cheerio';
import { Sticker } from 'wa-sticker-formatter';

async function gifsSearch(q) {
    try {
        const searchUrl = `https://tenor.com/search/${q}-gifs`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $("figure.UniversalGifListItem").each((i, el) => {
            const $el = $(el);
            const img = $el.find("img");  
            const gifUrl = img.attr("src");
            const alt = img.attr("alt") || "No description";
            const detailPath = $el.find("a").first().attr("href"); 

            if (gifUrl && gifUrl.endsWith('.gif') && detailPath) {
                results.push({
                    gif: gifUrl,
                    alt,
                    link: "https://tenor.com" + detailPath
                });
            }
        });

        return results;

    } catch (error) {
        console.error("Error fetching GIFs:", error);
        return [];
    }
}

const handler = async (m, { conn, text, command }) => {
    if (!text) throw `Example: .${command} silana ai 3`;

    const [query, countStr] = text.split(/(?<=^\S+)\s/);
    const count = Math.min(Number(countStr) || 1, 10);

    const results = await gifsSearch(query);
    if (!results.length) throw 'GIF not found!';

    const picks = [];
    const usedIndexes = new Set();
    while (picks.length < count && usedIndexes.size < results.length) {
        const i = Math.floor(Math.random() * results.length);
        if (!usedIndexes.has(i)) {
            usedIndexes.add(i);
            picks.push(results[i]);
        }
    }

    for (const pick of picks) {
        try {
            const { data } = await axios.get(pick.gif, {
                responseType: 'arraybuffer'
            });

            const sticker = new Sticker(data, {
                type: 'full',
                pack: 'silana ai',
                author: 'bot By noureddine ouafy', // Watermark added here
                quality: 70
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
        } catch (e) {
            console.error(`Failed to send sticker: ${pick.gif}`);
        }
    }
};

handler.help = ['gif-sticker'];
handler.tags = ['sticker'];
handler.command = /^gif-sticker$/i;
handler.limit = true 
export default handler;
