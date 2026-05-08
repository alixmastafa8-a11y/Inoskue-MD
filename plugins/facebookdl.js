import axios from 'axios';
import cheerio from 'cheerio';

const fsaver = {
    download: async (url) => {
        const fetchUrl = `https://fsaver.net/download/?url=${url}`;
        const headers = {
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        };
        try {
            const response = await axios.get(fetchUrl, { headers });
            const html = response.data;
            const data = await fsaver.getData(html);
            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    getData: async (content) => {
        try {
            const baseUrl = 'https://fsaver.net';
            const $ = cheerio.load(content);
            const videoSrc = $('.video__item').attr('src');

            if (!videoSrc) throw new Error('Video not found.');

            return { video: baseUrl + videoSrc };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

const handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide a valid Facebook video URL.\nExample: .fbdownload <link>';
    const url = args[0];
    m.reply('Please wait a moment...');

    try {
        const result = await fsaver.download(url);

        if (!result || result.success === false) {
            throw new Error(`Failed to fetch video. ${result?.message || 'Make sure the URL is valid.'}`);
        }

        const { video } = result;

        // Send the video via WhatsApp
        await conn.sendMessage(
            m.chat, {
                video: { url: video },
                caption: `Here is your video.`,
                mimetype: 'video/mp4',
                fileName: 'video.mp4'
            }, { quoted: m }
        );

    } catch (error) {
        console.error('Error sending video:', error.message);
        m.reply(`An error occurred while sending the video. ${error.message}`);
    }
};

handler.command = /^(facebookdl)$/i;
handler.help = ['facebookdl'];
handler.tags = ['downloader'];
handler.limit = true;
export default handler;