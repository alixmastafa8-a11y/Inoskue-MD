let handler = async (m, { conn, usedPrefix, command, text }) => {
  // منع الرد إذا لم يبدأ ببادئة
  if (!m.text.startsWith('.') && 
      !m.text.startsWith('/') && 
      !m.text.startsWith('!') && 
      !m.text.startsWith('#')) {
    return;
  }

  if (!text) {
    return m.reply(
      `أدخل اسم التطبيق\n\nمثال:\n${usedPrefix + command} facebook lite`,
    );
  }

  await m.reply("🔍 جاري البحث عن التطبيق...\n⏳ قد يستغرق الأمر وقتاً إذا كان الملف كبيراً.");

  try {
    let data = await aptoide.search(text);

    if (!data || data.length === 0) {
      return m.reply("❌ لم يتم العثور على أي نتائج لهذا الاسم.");
    }

    // نأخذ أول نتيجة (الأكثر صلة)
    let app = data[0];
    let downloadData = await aptoide.download(app.id);

    let caption = `
✅ *تم العثور على التطبيق بنجاح*

📱 *الاسم:* ${downloadData.appname}
👨‍💻 *المطور:* ${downloadData.developer}
📦 *الحجم:* ${app.size || 'غير معروف'}
🔖 *الإصدار:* ${app.version || 'غير معروف'}

⚠️ جاري إرسال الملف... (قد يستغرق دقائق إذا كان حجمه كبيراً)
`.trim();

    // إرسال صورة التطبيق
    await conn.sendMessage(
      m.chat,
      {
        image: { url: downloadData.img },
        caption: caption,
      },
      { quoted: m }
    );

    await m.reply("📤 جاري رفع الملف إلى واتساب...");

    // إرسال الملف باستخدام Stream (أفضل للملفات الكبيرة)
    let dl = await conn.getFile(downloadData.link);

    await conn.sendMessage(
      m.chat,
      {
        document: dl.data,           // يدعم Buffer أو Stream
        fileName: `${downloadData.appname}.apk`,
        mimetype: dl.mime || "application/vnd.android.package-archive",
      },
      { 
        quoted: m,
        // يمكن إضافة هذه الخيارات للملفات الكبيرة
        // ptv: false, 
        // seconds: 0 
      }
    );

    await m.reply("✅ تم إرسال التطبيق بنجاح!");

  } catch (e) {
    console.error(e);
    m.reply("❌ حدث خطأ أثناء تحميل أو إرسال التطبيق.\nربما الملف كبير جداً أو هناك مشكلة في الرابط.");
  }
};

handler.help = ["apk"];
handler.tags = ["downloader"];
handler.command = /^(apk|تطبيق)$/i;
handler.limit = true;

export default handler;

const aptoide = {
  search: async function (args) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(args)}&limit=10`
    );
    res = await res.json();

    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      return [];
    }

    return res.datalist.list.map((v) => ({
      name: v.name,
      size: v.size,
      version: v.file?.vername || 'غير معروف',
      id: v.package,
      download: v.stats?.downloads || 0,
    }));
  },

  download: async function (id) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`
    );
    res = await res.json();

    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      throw new Error("لم يتم العثور على التطبيق.");
    }

    const app = res.datalist.list[0];

    return {
      img: app.icon,
      developer: app.store?.name || 'غير معروف',
      appname: app.name,
      link: app.file?.path,
    };
  },
};
