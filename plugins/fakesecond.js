import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';
async function handler(m, { conn, usedPrefix, command, args, text }) {
  if (!text) return m.reply('send video/audio with caption .fakesecond <number>');
  const angka = args.join(' ');
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  if (!mime) throw 'Reply video/audio';
  const img = await q.download();
  const out = await uploadImage(img);
  let fileSizeLimit = 15 * 1024 * 1024; 
  if (img.length > fileSizeLimit) {
    throw 'لا يمكن أن يتجاوز حجم الوسائط 15 ميجابايت';
  }
  if (/^video/.test(mime)) {
    conn.sendMessage(m.chat, {
      video: img,
      gifPlayback: false,
      seconds: angka,
    });
  } else if (/^audio/.test(mime)) {
    conn.sendMessage(m.chat, {
      audio: img,
      seconds: angka,
    });
  } else {
    m.reply(`إرسال الصوت/الفيديو مع التسميات التوضيحية *\m${usedPrefix + command}* <الرقم> أو علامة الصوت/الفيديو التي تم إرسالها.`);
  }
}
handler.help = ['fakesecond'];
handler.tags = ['tools'];
handler.command = ['fakesecond'];
handler.premium = false;
handler.limit = true;
export default handler;