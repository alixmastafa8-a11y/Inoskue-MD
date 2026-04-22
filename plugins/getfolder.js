import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec)
let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('What is the folder name?')
  const folderPath = `./${text}`
  const zipName = `${text}.zip`
  const mimetype = 'application/zip'
  if (!fs.existsSync(folderPath)) return m.reply('Folder غير موجود')
  const jpegThumbnail = fs.existsSync('./thumbnail.jpg')
    ? fs.readFileSync('./thumbnail.jpg')
    : null
  m.reply('يرجى الانتظار, preparing your file...')
  try {
    await execAsync(`zip -r ${zipName} ${text}`)
    const fileBuffer = fs.readFileSync(zipName)
    await conn.sendMessage(
      m.chat,
      {
        document: fileBuffer,
        fileName: zipName,
        mimetype,
        ...(jpegThumbnail && { jpegThumbnail }),
      },
      { quoted: m }
    )
    fs.unlinkSync(zipName)
  } catch (err) {
    console.error(err)
    m.reply(`خطأ: ${err.message}`)
  }
}
handler.help = ['getfolder']
handler.tags = ['owner']
handler.command = /^(getfolder|gfo)$/i
handler.owner = true
export default handler