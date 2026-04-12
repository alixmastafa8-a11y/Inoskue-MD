import fs from "fs";

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `uhm.. where's the text?\n\nusage:\n${usedPrefix + command} <text>\n\nexemple:\n${usedPrefix + command} play`;
  let path = `plugins/${text}.js`;
  if (!fs.existsSync(path)) throw `File not found: ${path}`;
  await fs.unlinkSync(path);
  m.reply(`deleted ${text}.js`);
};

handler.help = ["حدف"];
handler.tags = ["owner"];
handler.command = /^حدف$/i;
handler.owner = true;

export default handler;