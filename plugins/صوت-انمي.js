import axios from "axios";
async function generate(text) {
  const xstr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  const xput = '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵𝟬'.split('');
  return text.toLowerCase().split('').map(ch => {
    const i = xstr.indexOf(ch);
    return i !== -1 ? xput[i] : ch;
  }).join('');
}
const models = {
  miku: { voice_id: "67aee909-5d4b-11ee-a861-00163e2ac61b", voice_name: "Hatsune Miku" },
  goku: { voice_id: "67aed50c-5d4b-11ee-a861-00163e2ac61b", voice_name: "Goku" },
  eminem: { voice_id: "c82964b9-d093-11ee-bfb7-e86f38d7ec1a", voice_name: "Eminem" },
};
function getRandomIp() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6)...",
  "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL)..."
];
async function tts(text) {
  const agent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const tasks = Object.entries(models).map(async ([key, { voice_id, voice_name }]) => {
    const payload = {
      raw_text: text,
      url: "https://filme.imyfone.com/text-to-speech/anime-text-to-speech/",
      product_id: "200054",
      convert_data: [{ voice_id, speed: "1", volume: "50", text, pos: 0 }]
    };
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Forwarded-For': getRandomIp(),
        'User-Agent': agent
      }
    };
    try {
      const res = await axios.post('https://voxbox-tts-api.imyfone.com/pc/v1/voice/tts', payload, config);
      const result = res.data.data.convert_result[0];
      return { model: key, voice_name, oss_url: result.oss_url };
    } catch (err) {
      return { model: key, error: err.message };
    }
  });
  return Promise.all(tasks);
}
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("من فضلك أرسل النص الذي تريد تحويله إلى صوت.");
  let msg = await m.reply("🔄 جاري تحويل النص إلى صوت...");
  const results = await tts(text);
  const first = results.find(r => r.oss_url);
  if (!first) return m.reply("❌ حدث خطأ أثناء توليد الصوت، حاول لاحقاً.");
  await conn.sendFile(m.chat, first.oss_url, 'tts.mp3', `🎤 Voice: ${first.voice_name}`, m);
};
handler.help = ['صوت-انمي'];
handler.tags = ['ai'];
handler.command = ['صوت-انمي'];
handler.limit = true;
export default handler;