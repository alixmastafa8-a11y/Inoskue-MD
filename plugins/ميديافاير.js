import axios from "axios"
import * as cheerio from "cheerio"
import crypto from "crypto"

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"
const MAX_SIZE = 100 * 1024 * 1024 

const getDirectDownload = async (filePageUrl) => {
  try {
    const res = await axios.get(filePageUrl, {
      headers: { "User-Agent": UA },
    })
    const $ = cheerio.load(res.data)
    return $("#downloadButton").attr("href") || null
  } catch {
    return null
  }
}

const downloadFile = async (url) => {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { "User-Agent": UA },
  })
  return Buffer.from(res.data)
}

const scrapeSingleFile = (fileUrl) => {
  const quickkey = fileUrl.match(/file\/([^/]+)/)?.[1]
  if (!quickkey) return []

  return [
    {
      filename: "mediafire-file",
      size: 0,
      quickkey,
      filePageUrl: `https://www.mediafire.com/file/${quickkey}/file`,
    },
  ]
}

const getFolderFiles = async (folderKey) => {
  let files = []
  let chunk = 1

  while (true) {
    const r = crypto.randomBytes(4).toString("hex")
    const url = `https://www.mediafire.com/api/1.4/folder/get_content.php?r=${r}&content_type=files&filter=all&order_by=name&order_direction=asc&chunk=${chunk}&version=1.5&folder_key=${folderKey}&response_format=json`

    const res = await axios.get(url, { headers: { "User-Agent": UA } })
    const content = res.data?.response?.folder_content
    const list = content?.files || []

    for (const f of list) {
      files.push({
        filename: f.filename,
        size: Number(f.size),
        quickkey: f.quickkey,
        filePageUrl: `https://www.mediafire.com/file/${f.quickkey}/file`,
      })
    }

    if (content?.more_chunks === "no") break
    chunk++
  }

  return files
}

const getAllItems = async (url) => {
  if (url.includes("/folder/")) {
    const key = url.match(/folder\/([^/]+)/)?.[1]
    return key ? await getFolderFiles(key) : []
  }

  if (url.includes("/file/")) {
    return scrapeSingleFile(url)
  }

  return []
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0])
    return conn.reply(
      m.chat,
      `*🔍 يرجى إرسال رابط ميديا فاير صالح.*\n\n*مثال:*\n${usedPrefix + command} https://www.mediafire.com/file/xxxxx`,
      m
    )

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

  try {
    const items = await getAllItems(args[0])
    if (!items.length)
      return conn.reply(m.chat, "❌ *لم أتمكن من العثور على أي ملفات في هذا الرابط.*", m)

    for (const item of items) {
      const direct = await getDirectDownload(item.filePageUrl)
      if (!direct) {
        await conn.reply(m.chat, `❌ *فشل في جلب الملف:* ${item.filename}`, m)
        continue
      }

      if (item.size > MAX_SIZE) {
        let msgTooLarge = `
╭─── 「 **مـلـف كـبـيـر جـداً** 」 ───⚔️
│
│ ⚠️ *حجم الملف يتجاوز الحد المسموح (100 ميجابايت).*
│ 📄 **الاسم:** ${item.filename}
│ 📦 **الحجم:** ${(item.size / 1024 / 1024).toFixed(2)} ميجابايت
│ 🔗 **رابط التحميل المباشر:**
│ ${direct}
│
╰──────────────────• 🐗`.trim()
        
        await conn.reply(m.chat, msgTooLarge, m)
        continue
      }

      await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } })
      
      const buffer = await downloadFile(direct)
      
      let captionText = `
╭─── 「 **تـحـمـيـل مـيـديـا فـايـر** 」 ───⚔️
│
│ 📄 **الاسم:** ${item.filename}
│ 📦 **الحجم:** ${(item.size / 1024 / 1024).toFixed(2)} ميجابايت
│
╰──────────────────• 🐗`.trim()

      await conn.sendMessage(m.chat, { react: { text: "📤", key: m.key } })

      await conn.sendFile(
        m.chat,
        buffer,
        item.filename,
        captionText,
        m
      )
      
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    }
  } catch (e) {
    conn.reply(m.chat, "❌ *حدث خطأ أثناء محاولة تحميل الملف.*", m)
  }
}

handler.help = ["mediafire"]
handler.command = ["mediafire", "ميديافاير", "ميديا"]
handler.tags = ["downloader"]
handler.limit = true

export default handler
