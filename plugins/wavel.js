import axios from 'axios';
const voices = {
  male: [
    { name: "Bradley Marshall", id: "waveltts_3786e470-7129-4f01-a263-0801b302acf1" },
    { name: "Rowan Flynn", id: "waveltts_7a16488d-eba0-4fa3-876a-97fbd57551ca" },
    { name: "Atlas", id: "waveltts_f5066419-beae-43c6-bf67-d8ad0cec52a5" },
    { name: "Cassius Grimwood", id: "waveltts_457e2c2d-3446-4c04-ada1-c24f2541fbb1" },
    { name: "Kaelin Vex", id: "waveltts_ff934526-807a-4210-bfa0-0878516f08c2" },
    { name: "Julian Stiles", id: "waveltts_50947fa3-1f62-418e-a725-47f96ff5c146" },
    { name: "Zayn", id: "waveltts_58f3fe09-64b3-42ca-a7a9-b80527accb56" },
    { name: "Ryder Winston", id: "waveltts_1732bec6-c5a4-43fd-954e-62e1f50d7f38" },
    { name: "Lucas Brooks", id: "waveltts_28d785c9-1e53-485d-a981-b0c55ba32918" }
  ],
  female: [
    { name: "Calista", id: "waveltts_aaf98444-e4e9-4bd6-9921-b307bbd2689e" },
    { name: "Serene Loh", id: "waveltts_297d3749-2394-4396-8324-e6fdb26846f0" },
    { name: "Nandi Khoza", id: "waveltts_9c637c4d-76fb-4568-815a-31947c7a61c1" },
    { name: "Sofía Mariposa", id: "waveltts_e51e20fb-4e89-41a0-9fbe-0f22f73c9557" },
    { name: "Dakshita", id: "waveltts_309de86f-2324-411f-ab8a-f8689455ec26" }
  ]
};
const languages = ["ml-IN", "en-US", "es-ES", "ja-JP", "id-ID", "ko-KR", "ru-RU"];
async function wavel_ai(prompt, lang, voiceName) {
  try {
    if (prompt.length > 500) throw new Error("The text is too long, maximum limit is 500 characters :3");
    if (!languages.includes(lang)) throw new Error(`Language not supported, available languages: ${languages.join(", ")}`);
    const allVoices = [...voices.male, ...voices.female];
    const voice = allVoices.find(v => v.name.toLowerCase() === voiceName.toLowerCase());
    if (!voice) throw new Error(`Voice غير موجود, available voices: ${allVoices.map(v => v.name).join(", ")}`);
    const url = 'https://wavel.ai/wp-json/custom/v1/synthesize-audio';
    const headers = {
      'accept': '*/*',
      'accept-language': 'id;q=0.5',
      'content-type': 'application/x-www-form-urlencoded',
      'origin': 'https://wavel.ai',
      'priority': 'u=1, i',
      'referer': 'https://wavel.ai/solutions/text-to-speech/anime-text-to-speech',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Brave";v="134"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'sec-gpc': '1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    };
    const data = new URLSearchParams({
      lang: lang,
      text: prompt,
      voiceId: voice.id
    }).toString();
    const response = await axios.post(url, data, { headers, responseType: 'json' });
    const base64 = response.data.base64Audio.split(';base64,')[1];
    return { status: response.status, output: Buffer.from(base64, 'base64') };
  } catch (error) {
    return { 
      status: error.response?.status || 500, 
      error: error.message 
    };
  }
}
let handler = async (m, { conn, text }) => {
  if (!text) {
    const allVoices = [...voices.male, ...voices.female];
    const voiceList = allVoices.map(v => v.name).join(", ");
    const langList = languages.join(", ");
    return m.reply(`يرجى إدخال the text, language, and voice name in the following format:
Command: wavel <text>|<language>|<voiceName>
Available voices: ${voiceList}
Supported languages: ${langList}
مثال: wavel Hello world|en-US|Bradley Marshall`);
  }
  const [prompt, lang, voiceName] = text.split('|');
  if (!prompt || !lang || !voiceName) {
    const allVoices = [...voices.male, ...voices.female];
    const voiceList = allVoices.map(v => v.name).join(", ");
    const langList = languages.join(", ");
    return m.reply(`Incorrect format, use:
Command: wavel <text>|<language>|<voiceName>
Available voices: ${voiceList}
Supported languages: ${langList}
مثال: wavel Hello world|en-US|Bradley Marshall`);
  }
  try {
    const result = await wavel_ai(prompt.trim(), lang.trim(), voiceName.trim());
    if (result.error) {
      return m.reply(`خطأ: ${result.error}`);
    }
    await conn.sendFile(m.chat, result.output, 'audio.mp3', '', m);
  } catch (error) {
    await m.reply(`خطأ: ${error.message}`);
  }
};
handler.help = ['wavel'];
handler.command = ['wavel'];
handler.tags = ['ai'];
handler.limit = true 
export default handler;