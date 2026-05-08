import fetch from 'node-fetch'

async function searchAptoide(query) {
    let url = `http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=10`
    let res = await fetch(url)
    let json = await res.json()
    if (!json.datalist?.list) return []
    return json.datalist.list.map(app => ({
        name: app.name,
        package: app.package
    }))
}

async function getAppInfo(packageName) {
    let url = `http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(packageName)}&limit=1`
    let res = await fetch(url)
    let json = await res.json()
    let app = json.datalist?.list?.[0]
    if (!app) throw new Error('التطبيق غير موجود')

    let obbLink = null
    let hasObb = false
    try {
        if (app.obb?.main?.path) {
            obbLink = app.obb.main.path
            hasObb = true
        }
    } catch {}

    return {
        name: app.name,
        package: app.package,
        icon: app.icon,
        obb: hasObb,
        obbLink
    }
}

async function getDownloadLink(packageName) {
    let url = `http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(packageName)}&limit=1`
    let res = await fetch(url)
    let json = await res.json()
    let app = json.datalist?.list?.[0]
    if (!app) throw new Error('التطبيق غير موجود')

    let downloadUrl = app.file?.path
    if (!downloadUrl) throw new Error('رابط التحميل غير متوفر')

    let head = await fetch(downloadUrl, { method: 'HEAD' })
    let size = parseInt(head.headers.get('content-length') || '0')
    let mimetype = head.headers.get('content-type') || 'application/vnd.android.package-archive'

    return { url: downloadUrl, size, mimetype }
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!text) return m.reply(`*🐗 Inoskue APK*\n\n📱 *مثال:*\n${usedPrefix}${command} facebook\n${usedPrefix}${command} free fire`)

    let react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    let packageName = text.trim()

    if (/^com\./i.test(packageName)) {
        await react('⏳')
        await m.reply('⏳ *جاري تحميل التطبيق...*')

        try {
            let info = await getAppInfo(packageName)
            let download = await getDownloadLink(packageName)

            if (download.size > 2_000_000_000) throw new Error('حجم الملف كبير جداً')

            await conn.sendMessage(m.chat, {
                image: { url: info.icon },
                caption: `📱 *${info.name}*\n📦 ${info.package}\n💾 ${(download.size / 1024 / 1024).toFixed(2)} MB`
            }, { quoted: m })

            await conn.sendMessage(m.chat, {
                document: { url: download.url },
                mimetype: download.mimetype,
                fileName: `${info.name}.apk`
            }, { quoted: m })

            if (info.obb && info.obbLink) {
                await m.reply(`📦 *جاري تحميل OBB...*`)
                await conn.sendMessage(m.chat, {
                    document: { url: info.obbLink },
                    mimetype: 'application/octet-stream',
                    fileName: `obb_${info.package}.zip`
                }, { quoted: m })
            }

            await react('✅')
        } catch (err) {
            console.error(err)
            await react('❌')
            await m.reply(`❌ ${err.message}`)
        }
        return true
    }

    await react('🔍')
    try {
        let apps = await searchAptoide(text)
        if (!apps.length) {
            await react('❌')
            return m.reply(`❌ لا توجد نتائج لـ "${text}"`)
        }

        let buttons = apps.map((app, i) => ({
            buttonId: `${usedPrefix}${command} ${app.package}`,
            buttonText: { displayText: `${i + 1}. ${app.name}` },
            type: 1
        }))

        await conn.sendMessage(m.chat, {
            text: `🔍 *نتائج البحث:* "${text}"\n\nاختر تطبيقاً للتحميل:`,
            buttons: buttons,
            footer: '🐗 Inoskue APK'
        }, { quoted: m })

        await react('📱')
    } catch (err) {
        console.error(err)
        await react('❌')
    }
}

handler.before = async function (m, { conn, command, usedPrefix }) {
    if (!m.text) return

    let txt = m.text.trim()

    if (txt.startsWith(usedPrefix + command + ' ')) {
        let packageName = txt.replace(usedPrefix + command + ' ', '').trim()
        if (/^com\./i.test(packageName)) {
            m.text = usedPrefix + command + ' ' + packageName
            return handler(m, { conn, text: packageName, command, usedPrefix })
        }
    }
}

handler.help = ['تطبيق', 'app', 'apk']
handler.command = /^(تطبيق|app|apk)$/i
handler.tags = ['downloader']

export default handler