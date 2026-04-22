import fetch from 'node-fetch'
const netflixTrending = async () => {
  const region = '/ar' 
  const netflixUrl = 'https://www.netflix.com' + region
  const response = await fetch(netflixUrl)
  if (!response.ok) throw Error(`Request failed: ${response.status} ${response.statusText}`)
  const html = await response.text()
  const jsonString = html.match(/reactContext = (.*?);/)?.[1]
  if (!jsonString) throw Error('Netflix data غير موجود!')
  const cleaned = jsonString.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)))
  const json = JSON.parse(cleaned)
  const movieAndShow = Object.entries(json.models.graphql.data).filter(v =>
    !v?.[1]?.__typename.match(/Genre|Query/))
  const result = movieAndShow.map(([_, v]) => {
    const genreList = v.coreGenres.edges.map(v => v.node.__ref)
    return {
      title: v.title,
      latestYear: v.latestYear,
      videoId: v.videoId,
      shortSynopsis: v.shortSynopsis,
      contentAdvisory: v.contentAdvisory.certificationValue,
      genre: genreList.map(v => json.models.graphql.data[v]?.name).join(', '),
      type: v.__typename,
      url: netflixUrl + '/title/' + v.videoId,
      poster: v['artwork({"params":{"artworkType":"BOXSHOT","dimension":{"width":200},"features":{"performNewContentCheck":false,"suppressTop10Badge":true},"format":"JPG"}})']?.url
    }
  })
  return result
}
let handler = async (m, { conn }) => {
  try {
    const data = await netflixTrending()
    const list = data.slice(0, 10).map((v, i) => {
      return `*${i + 1}. ${v.title}* (${v.latestYear})
نوع: ${v.type}
عمر: ${v.contentAdvisory}
التصنيف: ${v.genre}
الملخص: ${v.shortSynopsis}
🔗 ${v.url}`
    }).join('\n\n')
    await conn.reply(m.chat, `📺 *أفلام وترند Netflix حاليا:*\n\n${list}`, m)
  } catch (e) {
    await conn.reply(m.chat, '⚠️ حدث خطأ أثناء جلب بيانات نتفليكس:\n' + e.message, m)
  }
}
handler.help = ['netflix']
handler.tags = ['search']
handler.command = ['netflix']
handler.limit = true
export default handler