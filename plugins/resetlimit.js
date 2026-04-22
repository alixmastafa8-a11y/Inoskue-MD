const isNumber = (x = 0) => !isNaN(parseInt(x)) && typeof x === "number";
const handler = async (m, { conn, args }) => {
  let list = Object.entries(global.db.data.users);
  let lim = !args || !args[0] ? 50 : isNumber(args[0]) ? parseInt(args[0]) : 50;
  lim = Math.max(1, lim);
  list.forEach(([user, data]) => (data.limit = lim));
  await conn.reply(m.chat, `*نجحfully reset limit to ${lim} per user*`, m);
};
handler.help = ["resetlimit"];
handler.tags = ["owner"];
handler.command = /^(resetlimit)$/i;
handler.owner = true;
export default handler;