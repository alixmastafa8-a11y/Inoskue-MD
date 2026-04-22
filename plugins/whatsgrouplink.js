import axios from "axios";
import cheerio from "cheerio";
async function fetchSearchResults(query) {
  try {
    const searchUrl = `https://whatsgrouplink.com/?s=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, { timeout: 15000 });
    const $ = cheerio.load(data);
    const results = [];
    $("article").each((_, el) => {
      const title = $(el).find(".entry-title a").text().trim();
      const url = $(el).find(".entry-title a").attr("href");
      if (title && url) {
        results.push({ title, url });
      }
    });
    return results;
  } catch (error) {
    console.error("Search Error:", error.message);
    throw new Error("فشل to search for articles. The site might be down.");
  }
}
async function fetchGroupLinks(url) {
  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);
    const groups = [];
    $('ul.wp-block-list li a[href*="chat.whatsapp.com"]').each((i, el) => {
      const linkElement = $(el);
      const listItem = linkElement.parent();
      const href = linkElement.attr("href");
      const name = listItem.text().replace(linkElement.text(), "").replace(/[-:]/g, "").trim();
      groups.push(`${i + 1}. ${name || "WhatsApp Group"}\n   - Link: ${href}`);
    });
    return groups.length > 0
      ? groups.join("\n\n")
      : "No valid WhatsApp group links were found on this page. 😔";
  } catch (error) {
    console.error("Group Fetch Error:", error.message);
    throw new Error("فشل to process the group page.");
  }
}
const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `يرجى تقديم a search query.\n\n*مثال:* ${usedPrefix}${command} gaming`;
  }
  await m.reply("Searching for WhatsApp groups... 📲");
  try {
    const articles = await fetchSearchResults(text);
    if (articles.length === 0) {
      return m.reply(`Couldn't find any articles related to "*${text}*". Try a different كلمة البحث.`);
    }
    const firstArticle = articles[0];
    await m.reply(`Found article: *"${firstArticle.title}"*. Now fetching group links...`);
    const groupLinks = await fetchGroupLinks(firstArticle.url);
    const finalMessage = `
*Source Article:*
${firstArticle.title}
*🔗 Available Groups:*
---------------------
${groupLinks}
    `.trim();
    await m.reply(finalMessage);
  } catch (error) {
    console.error(error);
    m.reply(`حدث خطأ: ${error.message}`);
  }
};
handler.help = ["whatsgrouplink"];
handler.command = ["whatsgrouplink"];
handler.tags = ["search"];
handler.limit = true;
export default handler;