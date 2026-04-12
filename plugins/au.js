import gtts from 'gtts';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let handler = async (m, { conn, text, command }) => {
  if (command === 'تحويل') {
    if (!text) {
      await conn.sendMessage(m.chat, { text: `*يرجى إدخال النص لتحويله إلى كلام.*\n\n_الاستخدام:_\n.${command} مرحبًا، كيف حالك؟` }, { quoted: m });
      return;
    }

    try {
      const tmpFilePath = join(__dirname, 'tmp', 'speech.mp3');
      const speech = new gtts(text, 'ar');
      speech.save(tmpFilePath, async (err) => {
        if (err) {
          console.error(err);
          await conn.sendMessage(m.chat, { text: `حدث خطأ: ${err.message}` }, { quoted: m });
          return;
        }

        await conn.sendMessage(m.chat, {
          audio: fs.readFileSync(tmpFilePath),
          mimetype: 'audio/mpeg',
          ptt: true
        }, { quoted: m });

        fs.unlinkSync(tmpFilePath);
      });
    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { text: `حدث خطأ: ${e.message}` }, { quoted: m });
    }
  }
}

handler.help = ['au'];
handler.command = ['au'];
handler.tags = ['tools'];

export default handler;