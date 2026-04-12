import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import gtts from 'gtts';

let handler = async (m, { conn, text, command }) => {
  if (command === 'تحويل') {
    if (!text) {
      await conn.sendMessage(m.chat, { text: `*يرجى إدخال النص لتحويله إلى كلام.*\n\n_الاستخدام:_\n.${command} مرحبًا، كيف حالك؟` }, { quoted: m });
      return;
    }

    try {
      const tmpFilePath = join(tmpdir(), 'speech.mp3');
      const gttsStream = gtts(text, 'ar');
      const writeStream = createWriteStream(tmpFilePath);

      gttsStream.pipe(writeStream);

      writeStream.on('finish', async () => {
        await conn.sendMessage(m.chat, {
          audio: { url: tmpFilePath },
          mimetype: 'audio/mpeg',
          ptt: true
        }, { quoted: m });
      });

      writeStream.on('error', async (err) => {
        console.error(err);
        await conn.sendMessage(m.chat, { text: `حدث خطأ: ${err.message}` }, { quoted: m });
      });
    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { text: `حدث خطأ: ${e.message}` }, { quoted: m });
    }
  }
}

handler.help = ['تحويل'];
handler.command = ['تحويل'];
handler.tags = ['tools'];

export default handler;