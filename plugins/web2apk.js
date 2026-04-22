import axios from 'axios'
class Web2Apk {
  constructor() {
    this.baseURL = 'https://standalone-app-api.appmaker.xyz'
  }
  async startBuild(url, email) {
    try {
      const res = await axios.post(`${this.baseURL}/webapp/build`, { url, email })
      return res.data?.body?.appId
    } catch (err) {
      throw new Error('Start build failed: ' + err.message)
    }
  }
  async buildConfig(url, appID, appName) {
    try {
      const logo = 'https://logo.clearbit.com/' + url.replace('https://', '')
      const config = {
        appId: appID,
        appIcon: logo,
        appName: appName,
        isPaymentInProgress: false,
        enableShowToolBar: false,
        toolbarColor: '#03A9F4',
        toolbarTitleColor: '#FFFFFF',
        splashIcon: logo
      }
      const res = await axios.post(`${this.baseURL}/webapp/build/build`, config)
      return res.data
    } catch (err) {
      throw new Error('Build config failed: ' + err.message)
    }
  }
  async getStatus(appID) {
    try {
      while (true) {
        const res = await axios.get(`${this.baseURL}/webapp/build/status?appId=${appID}`)
        if (res.data?.body?.status === 'success') return true
        await this.delay(5000)
      }
    } catch (err) {
      throw new Error('Get status failed: ' + err.message)
    }
  }
  async getDownload(appID) {
    try {
      const res = await axios.get(`${this.baseURL}/webapp/complete/download?appId=${appID}`)
      return res.data
    } catch (err) {
      throw new Error('Get download failed: ' + err.message)
    }
  }
  async build(url, email, appName) {
    try {
      const appID = await this.startBuild(url, email)
      await this.buildConfig(url, appID, appName)
      await this.getStatus(appID)
      const download = await this.getDownload(appID)
      return download
    } catch (err) {
      throw err
    }
  }
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
let handler = async (m, { conn, text, usedPrefix, command }) => {
  conn.web2apk = conn.web2apk || {}
  const id = m.chat
  if (!text) {
    return m.reply(`*🌐 Web to APK Builder*\n\nUse:\n${usedPrefix + command} <url> | <email> | <app_name>\n\nمثال:\n${usedPrefix + command} https://google.com | test@gmail.com | Google App\n\n⌛ يرجى الانتظار a few minutes during build.`)
  }
  let [url, email, appName] = text.split('|').map(s => s.trim())
  if (!url || !email || !appName)
    return m.reply(`❌ Invalid format!\nCorrect usage:\n${usedPrefix + command} <url> | <email> | <app_name>`)
  if (!url.startsWith('http://') && !url.startsWith('https://'))
    url = 'https://' + url
  if (!email.includes('@') || !email.includes('.'))
    return m.reply('❌ Invalid email format.')
  if (id in conn.web2apk)
    return m.reply('⚠️ Build in progress. يرجى الانتظار until the current one finishes.')
  try {
    conn.web2apk[id] = true
    await m.reply(`🔧 *Starting APK Build...*\n\n🌍 URL: ${url}\n📧 Email: ${email}\n📱 App Name: ${appName}`)
    const builder = new Web2Apk()
    const result = await builder.build(url, email, appName)
    let downloadUrl = result?.body?.buildFile || result?.body?.downloadUrl || result?.body?.keyFile
    if (downloadUrl) {
      await m.reply(`✅ *Build نجح!*\n\n📱 *App:* ${appName}\n🌐 *Website:* ${url}\n📥 *Download:* ${downloadUrl}\n\n⏳ *Valid for 24 hours*`)
    } else {
      await m.reply('❌ *فشل to fetch the download URL.* Please try again.')
    }
  } catch (err) {
    await m.reply(`❌ *Build فشل!*\n\n${err.message}\n\nPossible reasons:\n• رابط غير صالح\n• API server down\n• Website not compatible`)
  } finally {
    delete conn.web2apk[id]
  }
}
handler.help = ['web2apk']
handler.tags = ['tools']
handler.command = /^(web2apk)$/i
handler.limit = true
handler.premium = false
export default handler