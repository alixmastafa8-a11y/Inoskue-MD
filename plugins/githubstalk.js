import axios from 'axios'
import cheerio from 'cheerio'
async function githubStalk(username) {
  try {
    const res = await axios.get(`https://github.com/${username}`)
    const $ = cheerio.load(res.data)
    const result = []
    const name = $('meta[property="profile:username"]').attr("content") || "Not found"
    const desc = $('meta[name="twitter:description"]').attr("content") || "No description"
    const followers = $(".text-bold.color-fg-default").eq(0).text().trim()
    const following = $(".text-bold.color-fg-default").eq(1).text().trim()
    const repos = $(".Counter").eq(0).text().trim()
    const projects = $(".Counter").eq(1).text().trim()
    const packages = $(".Counter").eq(2).text().trim()
    const stars = $(".Counter").eq(3).text().trim()
    result.push({ name, desc, followers, following, repos, projects, packages, stars })
    return result
  } catch (err) {
    console.log(err)
    return null
  }
}
let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('المرجو إدخال اسم مستخدم GitHub\nمثال:\n .githubstalk noureddineouafy')
  const data = await githubStalk(args[0])
  if (!data) return m.reply('حدث خطأ أثناء جلب المعلومات.')
  const info = data.map(a => 
    `*Username:* ${a.name}
*Bio:* ${a.desc}
*Followers:* ${a.followers}
*Following:* ${a.following}
*Repositories:* ${a.repos}
*Projects:* ${a.projects}
*Packages:* ${a.packages}
*Stars:* ${a.stars}`).join('\n\n')
  await m.reply(info)
}
handler.help = ['githubstalk']
handler.tags = ['search']
handler.command = ['githubstalk']
handler.limit = true;
export default handler