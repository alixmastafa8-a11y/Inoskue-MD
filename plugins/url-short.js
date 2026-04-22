import axios from 'axios';
async function shortenUrl(originalUrl, controlMode = 'full') {
    try {
        const apiUrl = 'https://lnk.ink/api/links';
        const response = await axios.post(apiUrl, {
            originalUrl,
            controlMode
        }, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err) {
        return { error: true, message: err.message, detail: err.response?.data };
    }
}
let handler = async (m, { args, conn }) => {
    if (!args[0]) {
        return m.reply('يرجى تقديم a URL to shorten.');
    }
    const originalUrl = args[0];
    const result = await shortenUrl(originalUrl);
    if (result.error) {
        return m.reply(`Error shortening URL: ${result.message}`);
    }
    let replyMessage = `URL Shortened نجحfully!
Original URL: ${result.originalUrl}
Short URL: ${result.shortUrl}
Stats URL: ${result.statsUrl}`;
    m.reply(replyMessage);
};
handler.help = handler.command = ['url-short'];
handler.tags = ['tools'];
handler.limit = true;
export default handler;