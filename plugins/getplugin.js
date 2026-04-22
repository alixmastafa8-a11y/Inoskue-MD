import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
let exec = promisify(_exec).bind(cp)
let handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
switch (command) {
case 'gp': case 'getplugin':
    if (!isROwner) return
    let ar = Object.keys(plugins)
    let ar1 = ar.map(v => v.replace('.js', ''))
    if (!text) throw `Enter the name of the plugin`
    if (!ar1.includes(text)) return m.reply(`*Not found*\n\n${ar1.map(v => ' ' + v).join`\n`}`)
    let o
    try {
        o = await exec('cat plugins/' + text + '.js')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim()) m.reply(stdout)
        if (stderr.trim()) m.reply(stderr)
    }
    break
    case 'gf':
    if (!isROwner) return
    if (!text) throw `Enter a file name`
    let O
    try {
        O = await exec('cat ' + text)
    } catch (e) {
        O = e
    } finally {
        let { stdout, stderr } = O
        if (stdout.trim()) m.reply(stdout)
        if (stderr.trim()) m.reply(stderr)
    }
    break 
}
}
handler.help = ['getplugin']
handler.command = ['getplugin','gp','gf']
handler.tags = ['owner']
handler.rowner = true
export default handler