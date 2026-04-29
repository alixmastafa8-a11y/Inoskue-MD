let timeout = 45000
let poin = 700

let handler = async (m, { conn, usedPrefix, command }) => {
  let id = m.chat
  conn.tebakbendera = conn.tebakbendera || {}

  if (id in conn.tebakbendera) {
    return conn.reply(m.chat, '⏳ *هناك جولة نشطة بالفعل!*', m)
  }

  let src = await (await fetch('https://gist.githubusercontent.com/Kyutaka101/4e01c190b7d67225ad7a86d388eeedf6/raw/67f0de059cea4b965a3f3bf211c12fc9c48043e5/gistfile1.txt')).json()
  let json = src[Math.floor(Math.random() * src.length)]

  let options = [json.name]
  while (options.length < 4) {
    let rand = src[Math.floor(Math.random() * src.length)].name
    if (!options.includes(rand)) options.push(rand)
  }
  options = options.sort(() => Math.random() - 0.5)

  let correctIndex = options.indexOf(json.name)
  let buttons = options.map((opt, i) => ({
    buttonId: `${usedPrefix}tebakbendera_ans ${i}`,
    buttonText: { displayText: opt },
    type: 1
  }))

  let msg = await conn.sendMessage(m.chat, {
    image: { url: json.img },
    caption: `╭───「 🧠 *تخمين العلم* 」───\n│\n│ ⏱️ *المهلة:* ${timeout / 1000} ثانية\n│ 💰 *الجائزة:* ${poin} نقطة\n│\n│ اختر اسم الدولة الصحيح من الأزرار أدناه:\n│\n╰────────────────\n\n🤖 *Inoskue* ⚡`,
    footer: 'اختر الإجابة الصحيحة',
    buttons: buttons
  }, { quoted: m })

  conn.tebakbendera[id] = {
    message: msg,
    answer: correctIndex,
    score: poin,
    timeout: setTimeout(() => {
      if (conn.tebakbendera[id]) {
        conn.reply(m.chat, `⏰ *انتهى الوقت!*\nالإجابة الصحيحة: *${json.name}*`, m)
        delete conn.tebakbendera[id]
      }
    }, timeout)
  }
}

handler.before = async function (m, { conn }) {
  let id = m.chat
  if (!conn.tebakbendera?.[id]) return

  let buttonResponse = m.message?.buttonsResponseMessage
  if (!buttonResponse) return

  let selectedId = buttonResponse.selectedButtonId
  if (!selectedId?.startsWith('.tebakbendera_ans')) return

  let game = conn.tebakbendera[id]
  let selectedIndex = parseInt(selectedId.split(' ')[1])

  clearTimeout(game.timeout)

  if (selectedIndex === game.answer) {
    await conn.sendMessage(m.chat, {
      text: `🎉 *إجابة صحيحة!*\n\n✅ لقد حصلت على *${game.score}* نقطة\n🧠 استمر في التحدي!\n\n🤖 *Inoskue* ⚡`,
      mentions: [m.sender]
    }, { quoted: game.message })
  } else {
    await conn.sendMessage(m.chat, {
      text: `❌ *إجابة خاطئة!*\n\n😔 حظاً أوفر في المرة القادمة\n\n🤖 *Inoskue* ⚡`,
      mentions: [m.sender]
    }, { quoted: game.message })
  }

  delete conn.tebakbendera[id]
}

handler.help = ['عين']
handler.tags = ['fun']
handler.command = /^عين$/i

export default handler
