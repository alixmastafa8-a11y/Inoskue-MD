import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

let handler = async (m, { conn, text, command }) => {
  if (command === 'عدد') {
    try {
      const usersFilePath = join(__dirname, 'users.json');
      let users = {};

      try {
        users = JSON.parse(await readFile(usersFilePath, 'utf8'));
      } catch (e) {
        // إذا لم يكن الملف موجودًا، قم بإنشاء ملف جديد
      }

      const userId = m.sender;
      if (!users[userId]) {
        users[userId] = true;
        await writeFile(usersFilePath, JSON.stringify(users, null, 2));
      }

      const userCount = Object.keys(users).length;
      await conn.sendMessage(m.chat, { text: `عدد المستخدِمين البوت: ${userCount}` }, { quoted: m });
    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { text: `An error occurred: ${e.message}` }, { quoted: m });
    }
  }
}

handler.help = ['عدد'];
handler.command = ['عدد'];
handler.tags = ['info'];

export default handler;