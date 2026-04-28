let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!m.text.startsWith('.') && 
      !m.text.startsWith('/') && 
      !m.text.startsWith('!') && 
      !m.text.startsWith('#')) {
    return;
  }

  if (!text) {
    return m.reply(`❓ *أدخل اسم التطبيق*\n\n📱 *مثال*:\n${usedPrefix + command} facebook lite`);
  }

  await m.reply("🔎 *جارٍ البحث عن التطبيق...*");

  try {
    let data = await aptoide.search(text);

    if (!data || data.length === 0) {
      return m.reply("❌ *لم يتم العثور على أي تطبيق بهذا الاسم.*");
    }

    let app = data[0];
    let downloadData = await aptoide.download(app.id);

    let caption = `✅ *تم العثور على التطبيق!*\n\n` +
                  `📱 *الاسم* : ${downloadData.appname}\n` +
                  `📦 *الحجم* : ${app.size || 'غير معروف'}\n` +
                  `🔖 *الإصدار* : ${app.version || 'غير معروف'}\n\n` +
                  `⏳ *جاري إرسال الملف...*`;

    await conn.sendMessage(m.chat, {
      image: { url: downloadData.img },
      caption: caption,
    }, { quoted: m });

    await m.reply("📤 *جاري رفع الملف إلى واتساب...*");

    let dl = await conn.getFile(downloadData.link);

    await conn.sendMessage(m.chat, {
      document: dl.data,
      fileName: `${downloadData.appname}.apk`,
      mimetype: dl.mime || "application/vnd.android.package-archive",
    }, { quoted: m });

    await m.reply("✅ *تم إرسال التطبيق بنجاح!*");

  } catch (e) {
    console.error(e);
    m.reply("❌ *حدث خطأ أثناء التحميل أو الإرسال.*\n🔁 *تأكد من صحة الرابط أو حجم الملف.*");
  }
};

handler.help = ["apk"];
handler.tags = ["downloader"];
handler.command = /^(apk|تطبيق)$/i;
handler.limit = true;

export default handler;

const aptoide = {
  search: async function (args) {
    let res = await global.fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(args)}&limit=10`);
    res = await res.json();
    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      return [];
    }
    return res.datalist.list.map((v) => ({
      name: v.name,
      size: formatSize(v.size),
      version: v.file?.vername || 'غير معروف',
      id: v.package,
      download: v.stats?.downloads || 0,
    }));
  },
  download: async function (id) {
    let res = await global.fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`);
    res = await res.json();
    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      throw new Error("لم يتم العثور على التطبيق.");
    }
    const app = res.datalist.list[0];
    return {
      img: app.icon,
      appname: app.name,
      link: app.file?.path,
    };
  },
};

function formatSize(bytes) {
  if (!bytes) return 'غير معروف';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  let i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}
