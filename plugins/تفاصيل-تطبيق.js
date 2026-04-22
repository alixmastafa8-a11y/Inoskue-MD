import axios from 'axios'
import cheerio from 'cheerio'
const detailDownload = async (url) => {
  try {
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)
    const appInfo = {
      Thumbnail: null,
      NamaApp: null,
      Versi: null,
      Developer: { Nama: null, Link: null },
      ArmDevice: { SupportedArchitecture: null, MinimalAndroid: null },
      NamaPaket: { ID: null, PlayStoreLink: null },
      DeskripsiApp: null,
      DownloadLinks: { MediaFire: null, GoogleDrive: null }
    }
    const thumbnail = $('table img').attr('src')
    if (thumbnail) appInfo.Thumbnail = thumbnail
    $('table').each((i, table) => {
      const rows = $(table).find('tr')
      rows.each((j, row) => {
        const header = $(row).find('td').eq(0).text().trim()
        const value = $(row).find('td').eq(1).text().trim()
        const link = $(row).find('a').attr('href')
        if (header === 'Nama App') appInfo.NamaApp = value
        if (header === 'Versi') appInfo.Versi = value
        if (header === 'Developer') {
          appInfo.Developer.Nama = value
          appInfo.Developer.Link = link
        }
        if (header === 'Arm / Device') {
          const [architecture, android] = value.split('Minimal Android')
          appInfo.ArmDevice.SupportedArchitecture = architecture.trim()
          appInfo.ArmDevice.MinimalAndroid = android ? android.trim() : null
        }
        if (header === 'Nama Paket') {
          appInfo.NamaPaket.ID = value
          appInfo.NamaPaket.PlayStoreLink = link
        }
      })
    })
    const description = $('#hidedesc td p').text().trim()
    if (description) appInfo.DeskripsiApp = description
    $('a').each((i, el) => {
      const href = $(el).attr('href')
      if (!href) return
      if (href.includes('mediafire.com')) appInfo.DownloadLinks.MediaFire = href
      if (href.includes('drive.google.com')) appInfo.DownloadLinks.GoogleDrive = href
    })
    return appInfo
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('يرجى إرسال رابط التطبيق من الموقع.\n يمكنك كتابة الامر :\n .modpak \n للحصول على الرابط ثم تقوم بعد ذلك باستعمال الامر متبوع بالرابط')
  const url = args[0]
  const details = await detailDownload(url)
  if (!details) return m.reply('فشل في جلب المعلومات.')
  const teks = `
*اسم التطبيق:* ${details.NamaApp}
*الإصدار:* ${details.Versi}
*المطور:* ${details.Developer.Nama} (${details.Developer.Link || 'لا يوجد'})
*المعمارية:* ${details.ArmDevice.SupportedArchitecture}
*أندرويد الأدنى:* ${details.ArmDevice.MinimalAndroid}
*اسم الباكيج:* ${details.NamaPaket.ID}
*رابط المتجر:* ${details.NamaPaket.PlayStoreLink || 'لا يوجد'}
*الوصف:* ${details.DeskripsiApp || 'لا يوجد'}
*روابط التحميل:*
- MediaFire: ${details.DownloadLinks.MediaFire || 'غير متوفر'}
- Google Drive: ${details.DownloadLinks.GoogleDrive || 'غير متوفر'}
`.trim()
  await conn.sendMessage(m.chat, {
    image: { url: details.Thumbnail },
    caption: teks
  }, { quoted: m })
}
handler.help = ['تفاصيل-تطبيق']
handler.tags = ['downloader']
handler.command = ['تفاصيل-تطبيق']
handler.limit = true 
export default handler