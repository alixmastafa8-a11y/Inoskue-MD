import axios from 'axios';
import { randomBytes } from 'crypto';
import { writeFileSync, unlinkSync } from 'fs';
const handler = async (m, { conn, text }) => {
    try {
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `🎓 *DegreeGuru AI*\n\nUsage example:\n.degree <question>\nمثال: .degree How to conduct scientific research?`,
                contextInfo: {
                    externalAdReply: {
                        title: 'Academic Assistance',
                        body: 'Powered by DegreeGuru',
                        thumbnailUrl: 'https://i.ibb.co/7Q6X8hG/degree.jpg',
                        sourceUrl: 'https://degreeguru.vercel.app'
                    }
                }
            }, { quoted: m });
        }
        await conn.sendPresenceUpdate('composing', m.chat);
        const apiResponse = await axios.post('https://degreeguru.vercel.app/api/guru', 
            {
                messages: [
                    {
                        role: "system",
                        content: "**Welcome to DegreeGuru**\n\nYour ultimate companion in navigating the academic landscape of Stanford."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            },
            {
                headers: {
                    'accept': '*/*',
                    'content-type': 'application/json',
                    'origin': 'https://degreeguru.vercel.app',
                    'referer': 'https://degreeguru.vercel.app/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
                }
            }
        ).then(res => res.data).catch(() => ({ error: 'فشل to get API response' }));
        const resultText = apiResponse.error 
            ? `⚠️ خطأ: ${apiResponse.error}`
            : JSON.stringify(apiResponse, null, 2);
        if (resultText.length > 1500) {
            const filename = `degree_${randomBytes(4).toString('hex')}.json`;
            writeFileSync(filename, resultText);
            await conn.sendMessage(m.chat, {
                document: { url: filename },
                fileName: `DegreeGuru_Result_${Date.now()}.json`,
                mimetype: 'application/json',
                caption: `📚 Result for: ${text.slice(0, 35)}${text.length > 35 ? '...' : ''}`
            }, { quoted: m });
            return unlinkSync(filename);
        }
        await conn.sendMessage(m.chat, {
            text: `🎓 *DegreeGuru Result*\n\n${resultText}`,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: 'Academic Assistant',
                    body: 'Powered by AI',
                    thumbnailUrl: 'https://i.ibb.co/7Q6X8hG/degree.jpg',
                    sourceUrl: 'https://degreeguru.vercel.app'
                }
            }
        }, { quoted: m });
    } catch (e) {
        console.error('Error:', e);
        await conn.sendMessage(m.chat, {
            text: `❌ خطأ: ${e.message}\nPlease try again or use a more specific question.`,
            mentions: [m.sender]
        }, { quoted: m });
    }
};
handler.help = ['degree-ai'];
handler.tags = ['ai'];
handler.command = /^(degree-ai)$/i;
handler.limit = false;
handler.premium = false;
export default handler;