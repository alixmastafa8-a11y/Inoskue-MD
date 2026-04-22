import axios from 'axios';
import cheerio from 'cheerio';
let handler = async (m, { conn, args, text }) => {
  if (!text) return m.reply('يرجى تقديم a search query!');
  const limit = args[1] || 3; 
  try {
    const results = await apkdogSearch(text, limit);
    if (results.length === 0) return m.reply('لم يتم العثور على نتائج.');
    let message = 'Search Results:\n\n';
    results.forEach((result, index) => {
      message += `*${index + 1}. ${result.appName}*\n`;
      message += `- Version: ${result.appVersion}\n`;
      message += `- Rating: ${result.ratingCount}\n`;
      message += `- Updated: ${result.publishedDate}\n`;
      message += `- Size: ${result.details?.appSize || 'N/A'}\n`;
      message += `- Developer: ${result.details?.devName || 'N/A'}\n`;
      message += `- Download: ${result.appUrl}\n\n`;
    });
    m.reply(message);
  } catch (error) {
    m.reply(`حدث خطأ: ${error.message}`);
    console.error('Error in apkdogSearch:', error);
  }
};
handler.help = handler.command = ['بحث-تطبيق'];
handler.tags = ['search'];
export default handler;
async function apkdogSearch(query, limit = 3) {
  let response = await axios.get(`https://apk.dog/search/${query}`);
  let $ = cheerio.load(response.data);
  let results = [];
  $("div.wrap ul.apps_list li.item").each(function () {
    let title = $(this).find("a.app_link div.app_name").text().trim();
    let version = $(this).find("div.bottom_block div.version").text().trim().replace("version: ", "");
    let rating = $(this).find("div.bottom_block div.raging").text().trim().replace("rating: ★", "");
    let updated = $(this).find("div.bottom_block div.date").text().trim().replace("update: ", "");
    let icon = $(this).find("div.app_icon a img").attr("src");
    let url = $(this).find("a.app_link").attr("href");
    results.push({
      appName: title,
      appVersion: version,
      ratingCount: rating,
      publishedDate: updated,
      appIcon: icon,
      appUrl: url,
    });
  });
  for (let result of results.slice(0, limit)) {
    try {
      let html = await axios.get(result.appUrl);
      let $$ = cheerio.load(html.data);
      let details = {};
      $$('div.full ul.file_info li').each((i, element) => {
        const key = $$(element).find('div').text().trim();
        const value = $$(element).contents().not($$(element).find('div')).text().trim();
        if (key === 'Size') {
          details.appSize = value;
        } else if (key === 'Permissions') {
          details.permissionsCount = value;
        } else if (key === 'License') {
          details.license = value;
        } else if (key === 'Package name') {
          details.packageName = value;
        } else if (key === 'Category') {
          details.category = value;
        } else if (key === 'Developer') {
          details.devName = value;
        } else if (key === 'Developer email') {
          details.devMail = value;
        } else if (key === 'Android') {
          details.androidVersion = value;
        } else if (key === 'md5 hash') {
          details.md5Hash = value;
        } else if (key === 'Architecture') {
          details.architecture = value;
        }
        details.desciption = $$("div.full div.descr p.descr_text").text().trim();
      });
      result.details = details;
    } catch (error) {
      console.error(`Error fetching details for ${result.appName}: ${error.message}`);
    }
  }
  return results.slice(0, limit);
}