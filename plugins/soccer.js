import axios from 'axios';
import cheerio from 'cheerio';
let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!text) return m.reply(`مثال: ${usedPrefix + command} Cristiano Ronaldo`);
    try {
        const playerData = await Football(text);
        if (!playerData.nama) return m.reply('Player غير موجود or invalid name.');
        const message = `
🎮 *Player Info* 🎮
👤 *Name*: ${playerData.nama}
⚽ *Club*: ${playerData.klub}
🛡️ *Position*: ${playerData.posisi}
🎂 *Age*: ${playerData.umur}
🌍 *Country*: ${playerData.negara}
💰 *Transfer Value*: ${playerData.nilaiTransfer}
🤝 *Agent*: ${playerData.agen}
🔗 *Profile URL*: ${playerData.urlProfil}
🏟️ *Team URL*: ${playerData.urlTeam}
👕 *Player's Image*: ${playerData.fotoPemain}
⚽ *Team's Logo*: ${playerData.fotoTeam}
        `.trim();
        await conn.sendMessage(m.chat, { text: message, caption: playerData.fotoPemain }, { quoted: m });
    } catch (e) {
        m.reply('خطأ: ' + e.message);
    }
};
handler.help = ['soccer'];
handler.command = ['soccer'];
handler.tags = ['search'];
handler.limit = true
export default handler;
async function Football(player) {
    const ress = await axios.get(`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${player}`);
    const $ = cheerio.load(ress.data);
    const elem = $('.inline-table').first();
    const data = {
        nama: elem.find('a[title]').first().attr('title'),
        klub: elem.find('a[title]').last().attr('title'),
        posisi: elem.closest('tr').find('td.zentriert').eq(0).text().trim(),
        umur: elem.closest('tr').find('td.zentriert').eq(2).text().trim(),
        negara: elem.closest('tr').find('td.zentriert img.flaggenrahmen').attr('title'),
        nilaiTransfer: elem.closest('tr').find('td.rechts.hauptlink').text().trim(),
        agen: elem.closest('tr').find('td.rechts a').last().text().trim(),
        urlProfil: 'https://www.transfermarkt.com' + elem.find('td.hauptlink a').attr('href'),
        fotoPemain: elem.find('img.bilderrahmen-fixed').attr('src'),
        urlTeam: 'https://www.transfermarkt.com' + elem.closest('tr').find('td.zentriert a').attr('href'),
        fotoTeam: elem.closest('tr').find('td.zentriert img.tiny_wappen').attr('src')
    };
    return data;
}