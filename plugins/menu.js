import moment from 'moment-timezone'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
  const cmd = args[0] || 'list'
  let _menu = global.db.data.settings[conn.user.jid]
  let d = new Date(new Date + 3600000)
  let locale = 'ar'
  let week = d.toLocaleDateString(locale, { weekday: 'long' })
  let date = d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const tagCount = {}
  const tagHelpMapping = {}
  Object.keys(global.plugins)
    .filter(plugin => !plugin.disabled)
    .forEach(plugin => {
      const tagsArray = Array.isArray(global.plugins[plugin].tags)
        ? global.plugins[plugin].tags
        : []
      if (tagsArray.length > 0) {
        const helpArray = Array.isArray(global.plugins[plugin].help)
          ? global.plugins[plugin].help
          : [global.plugins[plugin].help]
        tagsArray.forEach(tag => {
          if (tag) {
            if (tagCount[tag]) {
              tagCount[tag]++
              tagHelpMapping[tag].push(...helpArray)
            } else {
              tagCount[tag] = 1
              tagHelpMapping[tag] = [...helpArray]
            }
          }
        })
      }
    })

  let isiMenu = []
  Object.entries(tagCount).map(([key, value]) => isiMenu.push({
    header: `⚔️ ${key.toUpperCase()} ⚔️`,
    title: `📂 أوامر ${key}`,
    description: `🔥 ${value} ميزة`,
    id: ".menu " + key,
  })).join()

  const datas = {
    title: "⚔️ قائمة التحكم ⚔️",
    sections: [{
      title: "📜 جميع أوامر البوت",
      highlight_label: "كل الأوامر",
      rows: [{
        header: "🗂️ القائمة الكاملة",
        title: "عرض كل الأوامر",
        description: "",
        id: ".menu all",
      }],
    },
    {
      title: '📂 الأقسام',
      highlight_label: "الأقسام",
      rows: [...isiMenu]
    },
    {
      title: 'ℹ️ معلومات',
      highlight_label: "معلومات",
      rows: [
        {
          header: "🤖 البوت",
          title: "قائمة الأوامر",
          description: "",
          id: ".menu",
        },
        {
          header: "👑 المالك",
          title: "معلومات عن صاحب البوت",
          description: "",
          id: ".owner",
        },
        {
          header: "📊 الإحصائيات",
          title: "إحصائيات الأوامر",
          description: "",
          id: ".menu",
        },
        {
          header: "⏱️ السرعة",
          title: "سرعة استجابة البوت",
          description: "",
          id: ".ping",
        }
      ]
    }]
  }

  let totalHit = 0
  Object.values(db.data.stats).forEach(v => totalHit += v.success)

  let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
    return {
      help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium,
      enabled: !plugin.disabled,
    }
  })

  let headers = `⚔️ *إينوسكي بوت* ⚔️\n🗡️ رفيقك الأسطوري\n🛡️ قوة، سرعة، وذكاء\n━━━━━━━━━━━━━━━\n`

  if (cmd === 'list') {
    const daftarTag = Object.keys(tagCount).sort().map(t => `※ ${usedPrefix + command} ${t}`).join('\n')
    const more = String.fromCharCode(8206)
    const readMore = more.repeat(4001)
    let _mpt
    if (process.send) {
      process.send('uptime')
      _mpt = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let mpt = clockString(_mpt)
    let list = `${headers}${readMore}\n╭──「 📋 قائمة الأقسام 」\n${daftarTag}\n╰──────────────\n\n🔹 *${usedPrefix + command} all* لعرض كل الأوامر`
    const pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => thumbnail)

    if (_menu.image) {
      conn.sendMessage(m.chat, {
        text: list,
        contextInfo: {
          externalAdReply: {
            title: namebot,
            body: '⚔️ القائمة الرئيسية',
            thumbnailUrl: thumbnail,
            sourceUrl: sgc,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else if (_menu.gif) {
      conn.sendMessage(m.chat, {
        video: { url: "https://telegra.ph/file/ca2d038b71ff86e2c70d3.mp4" },
        gifPlayback: true,
        caption: list,
        contextInfo: {
          externalAdReply: {
            title: namebot,
            body: '⚔️ القائمة الرئيسية',
            thumbnailUrl: thumbnail,
            sourceUrl: sgc,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else if (_menu.teks) {
      conn.reply(m.chat, list, m)
    } else if (_menu.doc) {
      conn.sendMessage(m.chat, {
        document: fs.readFileSync("./package.json"),
        fileName: namebot,
        fileLength: new Date(),
        pageCount: "2024",
        caption: list,
        contextInfo: {
          externalAdReply: {
            containsAutoReply: true,
            mediaType: 1,
            mediaUrl: 'https://telegra.ph/file/74abb87ac6082571db546.jpg',
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: sgc,
            thumbnailUrl: thumbnail,
            title: `${date}`,
            body: '',
          },
        },
      }, { quoted: m })
    } else if (_menu.button) {
      conn.sendListImageButton(m.chat, `${headers}`, datas, '⚔️ اختر قسمًا من الأسفل ⚔️', thumbnail)
    }
  } else if (tagCount[cmd]) {
    const daftarHelp = tagHelpMapping[cmd].map((helpItem, idx) => {
      const premiumSign = help[idx]?.premium ? '🅟' : ''
      const limitSign = help[idx]?.limit ? 'Ⓛ' : ''
      return `.${helpItem} ${premiumSign}${limitSign}`
    }).join('\n│※ ')
    const more = String.fromCharCode(8206)
    const readMore = more.repeat(4001)
    const list2 = `${headers}${readMore}╭──「 ⚔️ ${cmd.toUpperCase()} ⚔️ 」\n├──────────────\n│※ ${daftarHelp}\n╰──────────────\n\n📌 *عدد الأوامر:* ${tagHelpMapping[cmd].length}`
    const pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => thumbnail)

    if (_menu.image) {
      conn.sendMessage(m.chat, {
        text: list2,
        contextInfo: {
          externalAdReply: {
            title: namebot,
            body: `⚔️ ${cmd} ⚔️`,
            thumbnailUrl: thumbnail,
            sourceUrl: sgc,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else if (_menu.gif) {
      conn.sendMessage(m.chat, {
        video: { url: "https://telegra.ph/file/ca2d038b71ff86e2c70d3.mp4" },
        gifPlayback: true,
        caption: list2,
        contextInfo: {
          externalAdReply: {
            title: namebot,
            body: `⚔️ ${cmd} ⚔️`,
            thumbnailUrl: thumbnail,
            sourceUrl: sgc,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else if (_menu.teks) {
      conn.reply(m.chat, list2, m)
    } else if (_menu.doc) {
      conn.sendMessage(m.chat, {
        document: fs.readFileSync("./package.json"),
        fileName: namebot,
        fileLength: new Date(),
        pageCount: "2024",
        caption: list2,
        contextInfo: {
          externalAdReply: {
            containsAutoReply: true,
            mediaType: 1,
            mediaUrl: 'https://telegra.ph/file/74abb87ac6082571db546.jpg',
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: sgc,
            thumbnailUrl: thumbnail,
            title: `${date}`,
            body: '',
          },
        },
      }, { quoted: m })
    } else if (_menu.button) {
      conn.sendListImageButton(m.chat, `⚔️ ${cmd.toUpperCase()} ⚔️\n\n${list2}`, datas, wm, thumbnail)
    }
  } else if (cmd === 'all') {
    const allTagsAndHelp = Object.keys(tagCount).map(tag => {
      const daftarHelp = tagHelpMapping[tag].map((helpItem, idx) => {
        const premiumSign = help[idx]?.premium ? '🅟' : ''
        const limitSign = help[idx]?.limit ? 'Ⓛ' : ''
        return `.${helpItem} ${premiumSign}${limitSign}`
      }).join('\n│※ ')
      return `╭──「 ⚔️ ${tag.toUpperCase()} ⚔️ 」\n├──────────────\n│※ ${daftarHelp}\n╰──────────────`
    }).join('\n')
    const more = String.fromCharCode(8206)
    const readMore = more.repeat(4001)
    let all = `${headers}${readMore}\n${allTagsAndHelp}\n\n${wm}`
    const pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => thumbnail)

    if (_menu.image) {
      conn.sendMessage(m.chat, {
        text: all,
        contextInfo: {
          externalAdReply: {
            title: namebot,
            body: '📋 جميع الأوامر',
            thumbnailUrl: thumbnail,
            sourceUrl: sgc,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else if (_menu.gif) {
      conn.sendMessage(m.chat, {
        video: { url: "https://telegra.ph/file/ca2d038b71ff86e2c70d3.mp4" },
        gifPlayback: true,
        caption: all,
        contextInfo: {
          externalAdReply: {
            title: namebot,
            body: '📋 جميع الأوامر',
            thumbnailUrl: thumbnail,
            sourceUrl: sgc,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else if (_menu.teks) {
      conn.reply(m.chat, all, m)
    } else if (_menu.doc) {
      conn.sendMessage(m.chat, {
        document: fs.readFileSync("./package.json"),
        fileName: namebot,
        fileLength: new Date(),
        pageCount: "2024",
        caption: all,
        contextInfo: {
          externalAdReply: {
            containsAutoReply: true,
            mediaType: 1,
            mediaUrl: 'https://telegra.ph/file/74abb87ac6082571db546.jpg',
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: sgc,
            thumbnailUrl: thumbnail,
            title: `${date}`,
            body: '',
          },
        },
      }, { quoted: m })
    } else if (_menu.button) {
      conn.sendListImageButton(m.chat, `⚔️ جميع الأوامر ⚔️\n${all}`, datas, 'https://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V', thumbnail)
    }
  } else {
    conn.reply(m.chat, `❌ القسم "${cmd}" غير موجود.\nاستخدم *${usedPrefix + command} list* أو *${usedPrefix + command} all*`, m)
  }
}

handler.help = ['menu']
handler.command = ['menu']
handler.register = false
export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
