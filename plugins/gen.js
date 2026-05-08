import axios from "axios"; 
async function translateToEnglish(text) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" +
      encodeURIComponent(text);
    const response = await axios.get(url);
    return response.data[0].map(t => t[0]).join("");
  } catch (error) {
    console.error("Translation failed:", error.message);
    return text; 
  }
}
const API_KEY = "E64FUZgN4AGZ8yZr";
const BASE_URL = "https://getimg-x4mrsuupda-uc.a.run.app";
const IMAGE_API_ENDPOINT = `${BASE_URL}/api-premium`;
let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0])
        return m.reply(`❗ Please write a prompt.\nمثال:\n${usedPrefix + command} مدينة مستقبلية فالغروب`);
    let originalPrompt = args.join(" ");
    await m.reply(
      "المرجو إنتضار قليلا🍷 لاتنسى متابعة قناة البوت 🐗⭐ https://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V"
    );
    try {
        const prompt = await translateToEnglish(originalPrompt);
        const requestBody = new URLSearchParams({
            prompt: prompt,
            width: 512,
            height: 512,
            num_inference_steps: 20
        }).toString();
        const config = {
            method: "POST",
            url: IMAGE_API_ENDPOINT,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Dzine-Media-API": API_KEY,
            },
            data: requestBody 
        };
        const res = await axios(config);
        const data = res.data; 
        if (res.status !== 200) {
            throw new Error(`API خطأ: Status ${res.status}. Response: ${JSON.stringify(data)}`);
        }
        if (!data?.url) {
            return m.reply("❌ فشل to generate image. The API did not return an image URL.");
        }
        await conn.sendMessage(m.chat, {
            image: { url: data.url },
            caption: `✔ Image Generated نجحfully!\nPrompt (AR): ${originalPrompt}\nPrompt (EN): ${prompt}`
        }, { quoted: m });
    } catch (e) {
        console.error("Image Generation Error:", e);
        return m.reply(`❌ حدث خطأ during image generation: ${e.message}`);
    }
};
handler.help = handler.command = ['gen'];
handler.tags = ['ai'];
handler.limit = true;
export default handler;
