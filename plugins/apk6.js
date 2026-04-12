import axios from 'axios';

let handler = async (m, { conn, text, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { text: `*🔍 Please provide an app name to search.*\n\n_Usage:_\n.${command} Instagram` }, { quoted: m });
    return;
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } });
    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
      await conn.sendMessage(m.chat, { text: "❌ *No APK found for your query.*" }, { quoted: m });
      return;
    }

    const app = data.datalist.list[0];
    const sizeMB = (app.size / (1024 * 1024)).toFixed(2);

    if (sizeMB > 100) {
      await conn.sendMessage(m.chat, { text: `❌ *The file size (${sizeMB} MB) exceeds the 100MB limit.*` }, { quoted: m });
      return;
    }

    const caption = ` 🎮 *App Name:* ${app.name}
📦 *Package:* ${app.package}
📅 *Last Updated:* ${app.updated}
📁 *Size:* ${sizeMB} MB `.trim();

    await conn.sendMessage(m.chat, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(m.chat, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: 'application/vnd.android.package-archive',
      caption: caption,
      contextInfo: {
        externalAdReply: {
          title: app.name,
          body: "june md",
          mediaType: 1,
          sourceUrl: app.file.path_alt,
          thumbnailUrl: app.icon,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `An error occurred: ${e.message}` }, { quoted: m });
  }
}

handler.help = ['apk6'];
handler.command = ['apk6'];
handler.tags = ['downloader'];
handler.limit = true;
handler.args = true;

export default handler;