import axios from 'axios'
async function createPoster(prompt, text = '', type = 'custom', style = 'minimal') {
  if (!prompt) return 'فين هو البرومبت؟'
  try {
    const { data } = await axios.post(
      'https://app.signpanda.me/seo_tools/ai_poster_generator',
      {
        prompt: prompt,
        poster_type: type,
        style: style,
        overlay_text: text
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'app.signpanda.me',
          'Origin': 'https://www.appointo.me',
          'Referer': 'https://www.appointo.me/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        }
      }
    )
    return data
  } catch (e) {
    return e.message || 'حدث خطأ أثناء إنشاء البوستر'
  }
}
let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `📌 طريقة الاستخدام:\n\n${usedPrefix + command} <prompt> | <text> | <type> | <style>\n\n🖼️ الأنواع: event, movie, motivational, sale, festival, birthday, custom\n🎨 الأساليب: minimal, bold, vintage, realistic, cartoon\n\n📍 مثال:\n${usedPrefix + command} كتاب يعلم البرمجة | Learn To Code | sale | realistic`
    )
  }
  let input = args.join(' ').split('|').map(v => v.trim())
  let prompt = input[0]
  let text = input[1] || ''
  let type = input[2] || 'custom'
  let style = input[3] || 'minimal'
  m.reply('⏳ يتم الآن إنشاء البوستر، المرجو الانتظار...')
  try {
    let result = await createPoster(prompt, text, type, style)
    if (result?.image_url) {
      await conn.sendFile(m.chat, result.image_url, 'poster.jpg', `✅ تم إنشاء البوستر بنجاح`, m)
    } else {
      throw '❌ لم يتم الحصول على الصورة. تأكد من البيانات.'
    }
  } catch (e) {
    console.error(e)
    m.reply(`❌ وقع خطأ: ${e}`)
  }
}
handler.help = ['poster']
handler.tags = ['ai']
handler.command = ['poster']
handler.limit = true
export default handler