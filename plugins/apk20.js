import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    let msg = `*🤖 Inoskue Bot يحتاج اسم التطبيق!*\n\n📱 *مثال*:\n${usedPrefix}${command} واتساب\n${usedPrefix}${command} Telegram`
    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    return
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } })

    let apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}/limit=3`
    let { data } = await axios.get(apiUrl)

    if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
      await conn.sendMessage(m.chat, { text: '❌ *عذراً، لم يتم العثور على أي تطبيق بهذا الاسم.*\n🔁 جرب البحث باسم مختلف.' }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '😕', key: m.key } })
      return
    }

    let app = data.datalist.list[0]
    let sizeMB = (app.size / (1024 * 1024)).toFixed(2)
    let sizeLimit = 260

    if (sizeMB > sizeLimit) {
      await conn.sendMessage(m.chat, { text: `🤖💢 *الملف كبير جداً!*\n\n📦 الحجم: *${sizeMB} ميجابايت*\n🚫 الحد المسموح: ${sizeLimit} ميجابايت\n\nجرب تطبيقاً آخر.` }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '📦', key: m.key } })
      return
    }

    let iconUrl = app.icon || app.graphic
    let caption = `
╭━━━━━━━━━━━━━━━━━━━═
┃ 🤖✨ *Inoskue Bot* ✨🤖
╰━━━━━━━━━━━━━━━━━━━╌

📱 *الاسم*: ${app.name}
📦 *الحزمة*: ${app.package}
🔢 *الإصدار*: ${app.file.vername}
💾 *الحجم*: ${sizeMB} ميجابايت
⬇️ *مرات التحميل*: ${app.stats.downloads.toLocaleString()}
🏪 *المتجر*: Aptoide

📤 *جاري إرسال الملف...*
    `.trim()

    try {
      await conn.sendMessage(m.chat, { 
        image: { url: iconUrl },
        caption: caption
      }, { quoted: m })
    } catch (imgErr) {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    }
    
    await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } })

    await conn.sendMessage(m.chat, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: 'application/vnd.android.package-archive'
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: `*🤖 عذراً، حدث خطأ:*\n${error.message}` }, { quoted: m })
  }
}

handler.help = ['apk20']
handler.command = ['apk20']
handler.tags = ['downloader']
handler.limit = 2

export default handler
