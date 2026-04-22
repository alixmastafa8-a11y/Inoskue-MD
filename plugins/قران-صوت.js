import axios from 'axios';
const Murottal = {
    async list() {
        try {
            let res = await axios.get('https://www.assabile.com/ajax/loadplayer-12-9');
            if (!res.data || !res.data.Recitation) throw new Error('Invalid data format');
            return res.data.Recitation;
        } catch (error) {
            console.error('Error while fetching the murottal list:', error.message);
            return [];
        }
    },
    async search(q) {
        let list = await Murottal.list();
        if (list.length === 0) return [];
        if (typeof q === 'number') return [list[q - 1]];
        q = q.toLowerCase().replace(/\W/g, '');
        return list.filter(_ => 
            _.span_name.toLowerCase().replace(/\W/g, '').includes(q)
        );
    },
    async audio(d) {
        try {
            if (!d.href) throw new Error('Data does not contain href');
            let res = await axios.get(`https://www.assabile.com/ajax/getrcita-link-${d.href.slice(1)}`, {
                headers: {
                    'authority': 'www.assabile.com',
                    'accept': '*/*',
                    'referer': 'https://www.assabile.com/abdul-rahman-al-sudais-12/abdul-rahman-al-sudais.htm',
                    'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
                    'sec-ch-ua-mobile': '?1',
                    'sec-ch-ua-platform': '"Android"',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
                    'x-requested-with': 'XMLHttpRequest'
                },
                decompress: true
            });
            if (!res.data) throw new Error('فشل to fetch audio');
            return res.data;
        } catch (error) {
            console.error('Error while fetching audio:', error.message);
            return null;
        }
    }
};
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('يرجى إدخال the name or number of the Surah.');
    try {
        let searchResults = await Murottal.search(isNaN(parseInt(text)) ? text : parseInt(text));
        if (searchResults.length === 0) return m.reply('No murottal found for the given search.');
        let audioUrl = await Murottal.audio(searchResults[0]);
        if (!audioUrl) return m.reply('فشل to retrieve audio.');
        await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4' }, { quoted: m });
    } catch (error) {
        console.error(error);
        m.reply('حدث خطأ while fetching data.');
    }
};
handler.help = ['قران-صوت'];
handler.tags = ['islamic'];
handler.command = /^(quranmp3)$/i;
export default handler;