import fetch from 'node-fetch';
async function shortenUrl(longUrl) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    const body = new URLSearchParams({
        'xjxfun': 'create',
        'xjxargs[]': `S<![CDATA[${longUrl}]]>`
    });
    try {
        const response = await fetch('https://n9.cl/en', {
            method: 'POST',
            headers: headers,
            body: body
        });
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status} ${response.statusText}`);
        }
        const responseText = await response.text();
        const match = responseText.match(/location = "(.+?)";/);
        const resultUrl = match?.[1];
        if (!resultUrl) {
            throw new Error('فشل to extract the shortened URL from the API response.');
        }
        const finalUrl = resultUrl.replace('/en/r', '');
        return finalUrl;
    } catch (error) {
        throw error;
    }
}
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`يرجى تقديم a URL to shorten.\n\n*مثال:*\n${usedPrefix + command} https://github.com/features`);
    }
    const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
    if (!urlRegex.test(text)) {
        return m.reply('The text provided does not look like a valid URL.');
    }
    try {
        await m.reply('⏳ Shortening your URL, please wait...');
        const shortLink = await shortenUrl(text);
        await m.reply(
            `✅ URL shortened successfully!\n\n` +
            `*Original:* ${text}\n` +
            `*Shortened:* ${shortLink}`
        );
    } catch (error) {
        console.error('URL Shortener Error:', error);
        m.reply(`حدث خطأ: ${error.message}`);
    }
};
handler.help = ['n9cl'];
handler.command = ['n9cl'];
handler.tags = ['tools'];
handler.limit = true;
export default handler;