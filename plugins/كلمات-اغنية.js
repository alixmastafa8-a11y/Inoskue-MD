import axios from 'axios';
async function fetchLyrics(title) {
    if (!title) throw new Error('A song title is required.');
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(title)}`;
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        }
    });
    return data;
}
const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('يرجى تقديم a song title to search for.\n\n*مثال:* `.lyrics Faded`');
    }
    try {
        await m.reply(`Searching for lyrics for "*${text}*"...`);
        const results = await fetchLyrics(text);
        if (!results || results.length === 0) {
            return m.reply(`Sorry, I couldn't find any lyrics for "*${text}*".`);
        }
        const song = results[0];
        const lyricsText = song.syncedLyrics || song.plainLyrics;
        if (!lyricsText) {
            return m.reply(`Lyrics are not available for "*${song.trackName}*" by *${song.artistName}*.`);
        }
        const response = `*🎶 Lyrics Found!*\n\n*Title:* ${song.trackName}\n*Artist:* ${song.artistName}\n\n---\n\n${lyricsText}`;
        m.reply(response);
    } catch (error) {
        console.error('Lyrics Fetch Error:', error);
        m.reply('حدث خطأ while trying to fetch the lyrics. Please try again later.');
    }
};
handler.help = ['كلمات-اغنية'];
handler.command = ['كلمات-اغنية'];
handler.tags = ['search'];
handler.limit = true; 
export default handler;