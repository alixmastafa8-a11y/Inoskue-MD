import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const query = text ? text.trim() : ''
    if (!query) {
      return m.reply(
        `╭─── 「 🎤 تـشـغـيـل صـوت PTT 」 ───🎧\n` +
        `│\n` +
        `│ ❌ *أدخل اسم الأغنية أو الرابط!*\n` +
        `│\n` +
        `│ *مثال:*\n` +
        `│ ${usedPrefix + command} سورة البقرة\n` +
        `│\n` +
        `╰──────────────────• 🎶`
      )
    }

    if (query.length > 100) {
      return m.reply(`╭─── 「 ⚠️ خـطـأ 」 ───🎧\n│\n│ *الطلب طويل جداً!*\n│\n╰──────────────────• 🎶`)
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const response = await fetch(`https://api.nexray.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`)
    const data = await response.json()

    if (!data.status || !data.result?.download_url) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply(`╭─── 「 🔍 لـم يـتـم الـعـثـور 」 ───🎧\n│\n│ ❌ *لا توجد نتائج لـ:* "${query}"\n│\n╰──────────────────• 🎶`)
    }

    const result = data.result
    const audioUrl = result.download_url
    const filename = result.title || 'صوت غير معروف'

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    await m.reply(`🎵 *${filename}*\n📢 *تم الإرسال كرسالة صوتية.*`)

  } catch (error) {
    console.error('play2 error:', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply(`╭─── 「 ❌ خـطـأ 」 ───🎧\n│\n│ *حدث خطأ أثناء المعالجة.*\n│\n╰──────────────────• 🎶`)
  }
}

handler.help = ['play2']
handler.command = /^(play2)$/i
handler.tags = ['downloader']
handler.limit = true

export default handler
