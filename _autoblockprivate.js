let handler = m => m;

handler.before = async function (m, { conn, isOwner }) {
  if (m.isGroup || isOwner) return;

  const settings = global.db.data.settings[conn.user.jid];
  if (!('autoBlockPrivate' in settings)) settings.autoBlockPrivate = false;
  if (!settings.autoBlockPrivate) return;

  const username = m.sender.split('@')[0];
  const ownerJid = global.info?.nomerown + '@s.whatsapp.net';

  try {
    await conn.sendMessage(m.sender, {
      text:
        `╭─── 「 **تـنـبـيـه** 」 ───⚔️\n` +
        `│\n` +
        `│ 🚫 *لا يمكنك مراسلة البوت في الخاص!*\n` +
        `│\n` +
        `│ ✅ البوت يعمل فقط في المجموعات.\n` +
        `│\n` +
        `╰──────────────────• 🐗`
    });

    await conn.updateBlockStatus(m.sender, 'block');

    if (ownerJid) {
      await conn.sendMessage(ownerJid, {
        text:
          `╭─── 「 **حـظـر تـلـقـائـي** 」 ───⚔️\n` +
          `│\n` +
          `│ 🚫 *تم حظر مستخدم تلقائياً*\n` +
          `│ 👤 *الرقم:* +${username}\n` +
          `│ 💬 *رسالته:* ${m.text?.substring(0, 60) || '[ ميديا ]'}\n` +
          `│\n` +
          `╰──────────────────• 🐗`
      });
    }

  } catch (e) {
    console.error('[AutoBlockPrivate]', e.message);
  }
};

export default handler;
