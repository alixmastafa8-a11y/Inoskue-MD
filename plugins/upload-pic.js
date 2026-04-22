import axios from 'axios';
import FormData from 'form-data';
async function uploadImage(imageBuffer) {
    try {
        const form = new FormData();
        form.append('file', imageBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });
        const headers = {
            ...form.getHeaders(),
            'Content-Length': form.getLengthSync()
        };
        const response = await axios.post('https://www.pic.surf/upload.php', form, { headers });
        const identifier = response.data.identifier;
        return `https://www.pic.surf/${identifier}`;
    } catch (error) {
        throw new Error(`Upload failed: ${error.response ? error.response.data : error.message}`);
    }
}
const handler = async (m, { conn }) => {
    try {
        await m.react('⌛');
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime.startsWith('image')) {
            await m.react('❌');
            await conn.sendMessage(m.chat, { text: 'المرجو الاشارة لصورة التي تريد رفعها' }, { quoted: m });
            return;
        }
        let media = await q.download();
        let imageUrl = await uploadImage(media);
        await m.react('✅');
        let caption = `*${imageUrl}*`;
        await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    } catch (error) {
        await m.react('❌');
        await conn.sendMessage(m.chat, { text: `❌ *Error:* ${error.message}` }, { quoted: m });
    }
};
handler.help = ['upload-pic'];
handler.tags = ['uploader'];
handler.command = ['upload-pic'];
handler.limit = true;
export default handler;