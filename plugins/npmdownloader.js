import { exec } from 'child_process';
import fs from 'fs';
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*Example* :\n ${usedPrefix + command} yt-search`);
  async function npmDownloader(packageName, packageVersion) {
    try {
      const filePath = await new Promise((resolve, reject) => {
        exec(`npm pack ${packageName}@${packageVersion}`, (error, stdout) => {
          if (error) {
            m.reply('Error or package غير موجود');
            console.error(`exec error: ${error}`);
            reject(error);
            return;
          }
          resolve(stdout.trim());
        });
      });
      const fileName = filePath.split('/').pop();
      const data = await fs.promises.readFile(filePath);
      let link;
      if (packageVersion === 'latest') {
        link = `https://www.npmjs.com/package/${packageName}`;
      } else {
        link = `https://www.npmjs.com/package/${packageName}/v/${packageVersion}`;
      }
      await conn.sendMessage(m.chat, {
        document: data,
        mimetype: "application/zip",
        fileName: fileName,
        caption: `- \`Name\`: ${fileName}\n- \`Version\`: ${packageVersion}\n- \`Link\`: ${link}`
      }, {
        quoted: m
      });
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error(`خطأ: ${err}`);
    }
  }
  conn.sendMessage(m.chat, {
    react: {
      text: "⏱",
      key: m.key,
    }
  });
  try {
    const [packageName, version] = text.split(",");
    await npmDownloader(packageName, version || 'latest');
  } catch (error) {
    m.reply('An error seems to have occurred or the package was غير موجود');
  }
};
handler.help = ["npmdownloader"];
handler.tags = ["downloader"];
handler.command = ["npmdownloader"];
handler.limit = true 
export default handler;