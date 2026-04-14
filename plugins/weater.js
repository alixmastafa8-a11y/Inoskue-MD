import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*🤖 مثال:* ${usedPrefix}${command} الدار البيضاء`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕌', key: m.key } })

    let res = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(text)}&country=MA&method=8`)
    let data = res.data.data
    let timings = data.timings

    let msg = `
╭━━━━━━━━━━━━━━━━━═
┃ 🕌 *أوقات الصلاة* 🕌
╰━━━━━━━━━━━━━━━━━╌

📍 *المدينة*: ${text}
📅 *التاريخ*: ${data.date.readable}

🕋 *الفجر*: ${timings.Fajr}
🌅 *الشروق*: ${timings.Sunrise}
☀️ *الظهر*: ${timings.Dhuhr}
🌇 *العصر*: ${timings.Asr}
🌆 *المغرب*: ${timings.Maghrib}
🌙 *العشاء*: ${timings.Isha}

🤖 *Inoskue Bot*
    `.trim()

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ المدينة غير موجودة أو حدث خطأ.`)
  }
}

handler.help = ['صلاة']
handler.command = ['صلاة', 'prayer']
handler.tags = ['tools']
handler.limit = 1

export default handler
