import axios from 'axios'
import cheerio from 'cheerio'
async function igdl2(url) {
    let res = await axios("https://indown.io/")
    let _$ = cheerio.load(res.data)
    let referer = _$("input[name=referer]").val()
    let locale = _$("input[name=locale]").val()
    let _token = _$("input[name=_token]").val()
    let { data } = await axios.post(
        "https://indown.io/download",
        new URLSearchParams({
            link: url,
            referer,
            locale,
            _token,
        }),
        {
            headers: {
                cookie: res.headers["set-cookie"].join("; "),
            },
        }
    )
    let $ = cheerio.load(data)
    let result = []
    let __$ = cheerio.load($("#result").html())
    __$("video source").each(function () {
        let $$ = $(this)
        let videoUrl = $$.attr("src")
        if (videoUrl) {
            result.push({
                type: "video",
                url: videoUrl,
            })
        }
    })
    __$("img").each(function () {
        let $$ = $(this)
        let imgUrl = $$.attr("src")
        if (imgUrl && !imgUrl.includes('poster')) { 
            result.push({
                type: "image",
                url: imgUrl,
            })
        }
    })
    return result
}
let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'يرجى تقديم an Instagram post URL.'
    let results = await igdl2(args[0])
    if (!results.length) throw 'No media found.'
    for (let media of results) {
        if (media.type === 'video') {
            await conn.sendFile(m.chat, media.url, 'video.mp4', '', m)
        } else if (media.type === 'image') {
            await conn.sendFile(m.chat, media.url, 'image.jpg', '', m)
        }
    }
}
handler.help = ['انستا-منشور']
handler.tags = ['downloader']
handler.command = ['انستا-منشور']
handler.limit = true 
export default handler