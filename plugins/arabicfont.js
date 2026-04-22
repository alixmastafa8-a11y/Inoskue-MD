import fetch      from 'node-fetch'
import * as cheerio from 'cheerio'
import https      from 'https'
import http       from 'http'
import fs         from 'fs'
import path       from 'path'
import { createWriteStream } from 'fs'
import { execSync } from 'child_process'   
const BASE_URL   = 'https://alfont.com'
const OUTPUT_DIR = './tmp/alfont_fonts'
const ZIP_PATH   = './tmp/alfont_fonts.zip'
const DELAY_MS   = 1200
const TIMEOUT_MS = 30_000
const MAX_RETRY  = 3
const HEADERS = {
  'User-Agent'      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language' : 'ar,en;q=0.9',
  'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Referer'         : BASE_URL,
}
const sleep   = ms => new Promise(r => setTimeout(r, ms))
const safeFn  = str => str.replace(/[\\
async function getPage (url, tries = MAX_RETRY) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, timeout: TIMEOUT_MS })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return cheerio.load(await res.text())
    } catch {
      if (i < tries) await sleep(DELAY_MS * i)
    }
  }
  return null
}
async function collectFontPageUrls (maxFonts) {
  const seen  = new Set()
  const links = []
  let   page  = 1
  while (links.length < maxFonts) {
    const url = page === 1 ? `${BASE_URL}/` : `${BASE_URL}/page/${page}/`
    const $   = await getPage(url)
    if (!$) break
    let newFound = 0
    $('a[href*="-arabic-font-download.html"]').each((_, el) => {
      if (links.length >= maxFonts) return
      const raw  = $(el).attr('href') || ''
      const full = raw.startsWith('http') ? raw : `${BASE_URL}${raw}`
      if (!seen.has(full)) {
        seen.add(full)
        links.push(full)
        newFound++
      }
    })
    if (newFound === 0) break   
    page++
    await sleep(DELAY_MS)
  }
  return links
}
async function extractFontInfo (fontPageUrl) {
  const $ = await getPage(fontPageUrl)
  if (!$) return null
  let name = $('h1').first().text().trim()
  if (!name) {
    name = fontPageUrl
      .replace(/\/$/, '').split('/').pop()
      .replace(/-arabic-font-download\.html$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  }
  let downloadUrl = null
  const directHref = $('a[href*="wp-content/fonts"]').first().attr('href')
  if (directHref) {
    downloadUrl = directHref.startsWith('http') ? directHref : `${BASE_URL}${directHref}`
  }
  if (!downloadUrl) {
    $('a[href]').each((_, el) => {
      if (downloadUrl) return
      const href = ($(el).attr('href') || '').toLowerCase()
      if (['.ttf', '.otf', '.woff', '.woff2', '.zip'].some(e => href.includes(e))) {
        const raw = $(el).attr('href')
        downloadUrl = raw.startsWith('http') ? raw : `${BASE_URL}${raw}`
      }
    })
  }
  return downloadUrl ? { name, downloadUrl } : null
}
function downloadFile ({ name, downloadUrl }) {
  return new Promise(resolve => {
    const ext      = path.extname(new URL(downloadUrl).pathname) || '.ttf'
    const filename = `${safeFn(name)}${ext}`
    const filepath = path.join(OUTPUT_DIR, filename)
    if (fs.existsSync(filepath)) {
      return resolve({ status: 'skipped', name, filepath })
    }
    const proto = downloadUrl.startsWith('https') ? https : http
    const file  = createWriteStream(filepath)
    proto.get(downloadUrl, { headers: HEADERS }, res => {
      if (res.statusCode !== 200) {
        file.close(); fs.unlink(filepath, () => {})
        return resolve({ status: 'error', name, error: `HTTP ${res.statusCode}` })
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve({ status: 'ok', name, filepath }) })
    }).on('error', err => {
      file.close(); fs.unlink(filepath, () => {})
      resolve({ status: 'error', name, error: err.message })
    })
  })
}
function packToZip (filepaths) {
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)
  const files = filepaths.map(fp => `"${fp}"`).join(' ')
  execSync(`zip -j "${ZIP_PATH}" ${files}`, { stdio: 'ignore' })
  return ZIP_PATH
}
async function sendZip (conn, m, count) {
  const buffer   = fs.readFileSync(ZIP_PATH)
  const filename = `arabic_fonts_${count}.zip`
  await conn.sendMessage(
    m.chat,
    {
      document : buffer,
      mimetype : 'application/zip',
      fileName : filename,
      caption  : [
        `📦 *Arabic Fonts Pack*`,
        ``,
        `✅ *${count}* modern Arabic font${count !== 1 ? 's' : ''} from alfont.com`,
        `📁 \`${filename}\``,
        ``,
        `🔤 Extract and install the fonts on your device!`,
      ].join('\n'),
    },
    { quoted: m }
  )
}
function cleanup () {
  try {
    if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.readdirSync(OUTPUT_DIR).forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)))
      fs.rmdirSync(OUTPUT_DIR)
    }
  } catch (_) {}
}
async function runScraper (maxFonts) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const fontPageUrls = await collectFontPageUrls(maxFonts)
  if (!fontPageUrls.length) throw new Error('Could not find any font links on alfont.com')
  const infos = []
  for (const url of fontPageUrls) {
    const info = await extractFontInfo(url)
    if (info) infos.push(info)
    await sleep(DELAY_MS)
  }
  if (!infos.length) throw new Error('Found pages but no direct download links')
  const downloaded = []
  const failed     = []
  for (const info of infos) {
    const r = await downloadFile(info)
    if (r.status === 'ok' || r.status === 'skipped') downloaded.push(r.filepath)
    else failed.push(`${info.name}: ${r.error}`)
    await sleep(400)
  }
  if (!downloaded.length) throw new Error('All downloads failed')
  packToZip(downloaded)
  return { count: downloaded.length, total: infos.length, failed }
}
let handler = async (m, { conn, args }) => {
  const maxFonts = Math.min(Math.max(parseInt(args[0]) || 10, 1), 50)
  await conn.sendMessage(m.chat, {
    text: [
      `🔤 *AlFont Scraper*`,
      ``,
      `⚙️ Fetching *${maxFonts}* modern Arabic fonts …`,
      `⏳ يرجى الانتظار, scraping alfont.com now.`,
    ].join('\n'),
  }, { quoted: m })
  try {
    const result = await runScraper(maxFonts)
    await sendZip(conn, m, result.count)
    const lines = [
      `✅ *AlFont Scraper — Done!*`,
      ``,
      `📊 *Results:*`,
      `  • Requested : ${maxFonts}`,
      `  • Found     : ${result.total}`,
      `  • In ZIP    : ${result.count}`,
    ]
    if (result.failed.length) {
      lines.push(`  • فشل    : ${result.failed.length}`)
      result.failed.slice(0, 3).forEach(e => lines.push(`    ↳ ${e}`))
    }
    await conn.sendMessage(m.chat, { text: lines.join('\n') }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, {
      text: [
        `❌ *AlFont Scraper Error*`,
        ``,
        `${err.message}`,
        ``,
        `Try again in a moment.`,
      ].join('\n'),
    }, { quoted: m })
  } finally {
    cleanup()
  }
}
handler.help    = ['arabicfont']
handler.command = ['arabicfont']
handler.tags    = ['downloader']
handler.limit   = true
export default handler