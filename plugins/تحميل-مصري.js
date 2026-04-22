import axios from 'axios';
import * as cheerio from 'cheerio';
class EgyDeadScraper {
    constructor(baseURL = "https://egydead.center/") {
        this.baseURL = baseURL;
    }
    async search(query) {
        try {
            const url = `${this.baseURL}?s=${encodeURIComponent(query)}`;
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const results = $(".search-page .posts-list .movieItem").map((_, el) => {
                const element = $(el);
                return {
                    title: element.find(".BottomTitle").text().trim() || "No title",
                    link: element.find("a").attr("href") || "No link",
                    image: element.find("img").attr("src") || "No image",
                    category: element.find(".cat_name").text().trim() || "No category"
                };
            }).get();
            return results.length > 0
                ? { success: true, data: results }
                : { success: false, message: "لم يتم العثور على نتائج." };
        } catch (error) {
            return { success: false, message: error.message || "حدث خطأ." };
        }
    }
    async detail(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const details = {
                title: $('.singleTitle em').text().trim() || 'Not found',
                thumbnail: $('.single-thumbnail img').attr('src') || 'Not found',
                synopsis: $('.singleStory').text().trim() || 'Not found',
                story: $('.extra-content p').text().trim() || 'Not found',
                category: $('li span:contains("Category")').next('a').text().trim() || 'Not found',
                genres: $('li span:contains("Genre")').nextAll('a').map((_, el) => $(el).text().trim()).get(),
                quality: $('li span:contains("Quality")').next('a').text().trim() || 'Not found',
                language: $('li span:contains("Language")').next('a').text().trim() || 'Not found',
                country: $('li span:contains("Country")').next('a').text().trim() || 'Not found',
                year: $('li span:contains("Year")').next('a').text().trim() || 'Not found',
                duration: $('li span:contains("Duration")').next('a').text().trim() || 'Not found'
            };
            return details;
        } catch (error) {
            return { error: error.message };
        }
    }
    async download(url) {
        const payload = new URLSearchParams({ View: 1 });
        try {
            const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            const $ = cheerio.load(response.data);
            const watchLinks = $('.watchAreaMaster .serversList li').map((_, el) => ({
                provider: $(el).find('p').text().trim() || 'Not found',
                link: $(el).attr('data-link') || 'Not found'
            })).get();
            const downloadLinks = $('.downloadMaster .donwload-servers-list li').map((_, el) => ({
                provider: $(el).find('.ser-name').text().trim() || 'Not found',
                resolution: $(el).find('.server-info em').text().trim() || 'Not found',
                link: $(el).find('a.ser-link').attr('href') || 'Not found'
            })).get();
            return { watch: watchLinks, download: downloadLinks };
        } catch (error) {
            return { error: error.message };
        }
    }
}
const scraper = new EgyDeadScraper();
const handler = async (m, { conn, args, command }) => {
    if (!args[0]) throw `طريقة الاستخدام:\n.egysearch <query>\n.egydetail <link>\n.egydownload <link>`;
    m.reply('جارٍ المعالجة your request...');
    try {
        if (command === 'egysearch') {
            const results = await scraper.search(args.join(' '));
            if (results.success) {
                const message = results.data.map((item, idx) => 
                    `${idx + 1}. *${item.title}*\n- [Link](${item.link})\n- Category: ${item.category}\n`
                ).join('\n');
                m.reply(message || 'لم يتم العثور على نتائج.');
            } else {
                m.reply(results.message);
            }
        } else if (command === 'egydetail') {
            const details = await scraper.detail(args[0]);
            const message = `
*Title*: ${details.title}
*Synopsis*: ${details.synopsis}
*Story*: ${details.story}
*Category*: ${details.category}
*Year*: ${details.year}
`;
            m.reply(message);
        } else if (command === 'egydownload') {
            const downloads = await scraper.download(args[0]);
            const message = downloads.download.map((item, idx) => 
                `${idx + 1}. *${item.provider}*\n- Resolution: ${item.resolution}\n- [Download Link](${item.link})\n`
            ).join('\n');
            m.reply(message || 'لم يتم العثور على روابط تحميل.');
        }
    } catch (error) {
        m.reply(`حدث خطأ: ${error.message}`);
    }
};
handler.help = handler.command = ['تحميل-مصري'];
handler.tags = ['downloader'];
handler.limit = true 
export default handler;