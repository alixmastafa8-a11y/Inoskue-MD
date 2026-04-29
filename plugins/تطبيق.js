const newsletterJid = '120363424932450219@newsletter'
const newsletterName = 'Inoskue Newsletter'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return m.reply(`*🔍 𝐌𝐔𝐒𝐓𝐀𝐅𝐀 𝐀𝐏𝐊 𝐒𝐄𝐀𝐑𝐂𝐇*\n\nمثال: ${usedPrefix + command} WhatsApp`)
  }

  if (text.startsWith('id:')) {
    let appId = text.replace('id:', '').trim()
    try {
      await m.react('⏳')
      await m.reply('*⎔ جاري سحب بيانات التطبيق..*')
      let data = await aptoide.download(appId)
      if (!data.link) throw new Error('رابط غير موجود')

      let caption = `*☁️ 𝐌𝐔𝐒𝐓𝐀𝐅𝐀 𝐀𝐏𝐊𝟒𝟎*\n\n`
        + `📱 *الاسم:* ${data.appname}\n`
        + `👤 *المطور:* ${data.developer}\n`
        + `📦 *الحزمة:* ${appId}\n\n`
        + `*📤 جاري إرسال الملف...*`

      await conn.sendMessage(m.chat, {
        image: { url: data.img },
        caption,
        contextInfo: { forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 } }
      }, { quoted: m })

      let dl = await conn.getFile(data.link)
      await conn.sendMessage(m.chat, {
        document: dl.data,
        fileName: data.appname + '.apk',
        mimetype: 'application/vnd.android.package-archive',
        caption: '*✅ تم التحميل بنجاح.*'
      }, { quoted: m })
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      m.reply('*❌ فشل التحميل، قد يكون الملف كبيرًا أو الرابط معطلاً.*')
    }
    return
  }

  // 🔍 المرحلة الأولى: البحث وعرض الأزرار
  try {
    await m.react('🔍')
    let data = await aptoide.search(text)
    if (!data || data.length === 0) return m.reply('*❌ لا توجد نتائج.*')

    let buttons = data.map((v, i) => ({
      buttonId: `${usedPrefix}${command} id:${v.id}`,
      buttonText: { displayText: `${i + 1}. ${v.name} (${v.size})` },
      type: 1
    }))

    await conn.sendMessage(m.chat, {
      text: `*🔍 نتائج البحث عن "${text}"*\n\nاختر تطبيقًا لتحميله:`,
      buttons: buttons,
      footer: '⚡ 𝐌𝐔𝐒𝐓𝐀𝐅𝐀',
      headerType: 1,
      viewOnce: true
    }, { quoted: m,
         contextInfo: { forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 } }
    })
  } catch (e) {
    console.error(e)
    m.reply('*❌ حدث خطأ في البحث.*')
  }
}

handler.help = ['apk']
handler.tags = ['downloader']
handler.command = ['apk', 'تطبيق']

const aptoide = {
  search: async (query) => {
    try {
      let res = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=10`)
      let json = await res.json()
      if (!json.datalist || !json.datalist.list) return []
      return json.datalist.list.map(v => ({
        name: v.name,
        size: (v.size / 1024 / 1024).toFixed(2) + ' MB',
        version: v.file?.vername || 'غير معروف',
        id: v.package
      }))
    } catch { return [] }
  },
  download: async (id) => {
    try {
      let res = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`)
      let json = await res.json()
      let app = json.datalist.list[0]
      return {
        img: app.icon,
        developer: app.store?.name || 'مطور مجهول',
        appname: app.name,
        link: app.file?.path
      }
    } catch { return {} }
  }
}

export default handler
