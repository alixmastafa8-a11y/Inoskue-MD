let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.quoted) return m.reply(`يرجى الرد على رسالة الشخص الذي تريد طرده`);
  const user = m.quoted.sender;
  const name = await conn.getName(user);

  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
  m.reply(`تم طرد ${name} من الجروب`);
};

handler.help = ['طرد'];
handler.tags = ['group'];
handler.command = ['طرد'];
handler.group = true;
handler.admin = true;

export default handler;