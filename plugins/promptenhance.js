import axios from 'axios';
import crypto from 'crypto';
const KEY = "kR9p2sL7mZ3xA1bC5vN8qE4dF6gH2jK3";
const IV = "a1B2c3D4e5F6g7H8";
function decryptData(encryptedBase64) {
    try {
        const keyBuffer = Buffer.from(KEY).slice(0, 32);
        const ivBuffer = Buffer.from(IV).slice(0, 16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
        let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    } catch (err) {
        console.error('Decryption error:', err);
        throw new Error('فشل to decrypt data');
    }
}
async function getToken() {
    try {
        const res = await axios.get('https://prompthancer.com/api/token', {
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://prompthancer.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
            }
        });
        return {
            data: res.data,
            cookie: res.headers['set-cookie'] ? res.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ') : ''
        };
    } catch (e) {
        console.error("Error fetching token:", e);
        return e;
    }
}
async function promptEnhancer(prompt, type = 'basic') {
    if (!prompt) return 'Where is the prompt?';
    try {
        const endpoint = type === 'basic' ? 'https://prompthancer.com/api/enhancebasic' : 'https://prompthancer.com/api/enhancemid';
        const tokenResponse = await getToken();
        if (tokenResponse instanceof Error) {
            return `Error fetching token: ${tokenResponse.message}`;
        }
        const { data } = await axios.post(endpoint, {
            "originalPrompt": prompt,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenResponse.data.token}`,
                'Cookie': tokenResponse.cookie,
                'Origin': 'https://prompthancer.com',
                'Referer': 'https://prompthancer.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
            }
        });
        return data;
    } catch (e) {
        console.error("Prompt Enhancer API Error:", e);
        return e;
    }
}
const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let helpMessage = `*يرجى تقديم a prompt to enhance.*\n\n`;
        helpMessage += `*Usage مثال:*\n`;
        helpMessage += `${usedPrefix + command} a photorealistic cat wearing a wizard hat\n\n`;
        helpMessage += `*You can also specify an enhancement type:*\n`;
        helpMessage += `(basic, mid)\n`;
        helpMessage += `${usedPrefix + command} mid a logo for a coffee shop`;
        return conn.reply(m.chat, helpMessage, m);
    }
    let type = 'basic';
    let prompt = text;
    const availableTypes = ['basic', 'mid'];
    const firstWord = text.split(' ')[0].toLowerCase();
    if (availableTypes.includes(firstWord)) {
        type = firstWord;
        prompt = text.substring(firstWord.length).trim();
        if (!prompt) {
            return conn.reply(m.chat, `يرجى تقديم a prompt after specifying the type '${type}'.`, m);
        }
    }
    try {
        await conn.reply(m.chat, `*Enhancing your prompt with the '${type}' model...*\n\nيرجى الانتظار, this may take a moment.`, m);
        const result = await promptEnhancer(prompt, type);
        if (typeof result === 'string' || (result instanceof Error)) {
             throw new Error(result.message || result);
        }
        if (result && result.data) {
            const decryptedResult = decryptData(result.data);
            const finalPrompt = decryptedResult.enhancedPrompt || "No enhanced prompt found in the result.";
            await conn.reply(m.chat, `*✨ Enhanced Prompt ✨*\n\n${finalPrompt}`, m);
        } else {
            console.error("Unexpected API Response:", result);
            throw new Error('فشل to enhance prompt. The API returned an invalid response.');
        }
    } catch (e) {
        console.error("Handler Error:", e);
        await conn.reply(m.chat, `حدث خطأ: ${e.message}`, m);
    }
};
handler.help = ['promptenhance'];
handler.tags = ['ai'];
handler.command = ['promptenhance'];
handler.limit = true;
export default handler;