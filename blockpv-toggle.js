let handler = async (m, { conn, command }) => {

  const settings = global.db.data.settings[conn.user.jid];
  if (!('autoBlockPrivate' in settings)) settings.autoBlockPrivate = false;

  const isEnable = /^(تفعيل حظر خاص|enable blockpv)$/i.test(command);
  settings.autoBlockPrivate = isEnable;

  const status = isEnable ? '✅ مفعّل' : '❌ معطّل';
  const emoji  = isEnable ? '🔒' : '🔓';

  await conn.sendMessage(m.chat, {
    text:
      `╭─── 「 **حـظـر الـخـاص** 」 ───⚔️\n` +
      `│\n` +
      `│ ${emoji} *الحالة:* ${status}\n` +
      `│\n` +
      `│ ${isEnable
        ? '✅ سيتم حظر أي شخص يراسل البوت في الخاص تلقائياً.'
        : '✅ تم إيقاف الحظر التلقائي للخاص.'
      }\n` +
      `│\n` +
      `╰──────────────────• 🐗`
  }, { quoted: m });
};

handler.help = ['تفعيل حظر خاص', 'تعطيل حظر خاص'];
handler.tags = ['owner'];
handler.command = /^(تفعيل حظر خاص|تعطيل حظر خاص|enable blockpv|disable blockpv)$/i;
handler.rowner = true;

export default handler;
