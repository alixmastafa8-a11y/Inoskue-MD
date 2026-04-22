import cheerio from 'cheerio';
import fetch from 'node-fetch';
let handler = async (m, { conn, text }) => {
  const listOptions = ["all", "download"];
  const [feature, inputs] = text ? text.split("|") : ["all"];
  if (!listOptions.includes(feature)) {
    return conn.reply(
      m.chat,
      "❌ *الرجاء اختيار خيار صالح* \n\n*الإختيارات المتاحة:* \n" +
        listOptions.map((v) => `○ ${v}`).join("\n"),
      m
    );
  }
  if (feature === "all") {
    await conn.reply(m.chat, "⏳ *جاري جلب الوظائف... الرجاء الانتظار* 🔍", m);
    try {
      let res = await scrapeData();
      const buttons = res.map((item, index) => ({
        header: "",
        title: item.title,
        description: `📜 Views: ${item.views}`,
        id: `.alwadifa download|${index}`,
      }));
      conn.relayMessage(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: {
                title: "📋 *قائمة الوظائف المتاحة في المغرب*",
              },
              body: {
                text: "🔍 حدد وظيفة لقراءة التفاصيل والتسجيل",
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "🔎 الوظائف",
                      sections: [
                        {
                          title: "📜 الوظائف المتاحة",
                          highlight_label: "Silana Ai",
                          rows: buttons,
                        },
                      ],
                    }),
                    messageParamsJson: "",
                  },
                ],
              },
            },
          },
        },
      }, {});
    } catch (e) {
      console.error(e);
      await conn.reply(m.chat, "❌ *حدث خطأ while fetching jobs!*", m);
    }
  }
  if (feature === "download") {
    if (!inputs) return conn.reply(m.chat, "❌ *يرجى تقديم رقم الوظيفة أو الرابط للقراءة!*", m);
    await conn.reply(m.chat, "⏳ *قراءة تفاصيل الوظيفة... الرجاء الانتظار* 🔍", m);
    try {
      let res = await scrapeData();
      let url;
      if (/^\d+$/.test(inputs)) {
        url = res[parseInt(inputs)].link;
      } else {
        url = inputs;
      }
      let paragraphs = await getParagraphsFromURL(url);
      const content = paragraphs.length
        ? paragraphs.join("\n")
        : "❌ *No content found for this job!*";
      await conn.reply(m.chat, `🔍 *Job Details:*\n\n📜 ${content}`, m);
    } catch (e) {
      console.error(e);
      await conn.reply(m.chat, "❌ *حدث خطأ while reading the details!*", m);
    }
  }
};
handler.help = ["alwadifa"];
handler.tags = ["morocco"];
handler.command = /^alwadifa$/i;
handler.limit = true;
export default handler;
async function scrapeData() {
  const url = "http://alwadifa-maroc.com/";
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const items = [];
  $(".bloc-content").each((index, element) => {
    const link = $(element).find("a:first-child").attr("href");
    const title = $(element).find("a:first-child").text().trim();
    const image = $(element).find("img").attr("src");
    const [info, views, comments] = $(element)
      .find("li")
      .map((i, el) => $(el).text().trim())
      .get();
    items.push({
      title,
      link: link.startsWith("/") ? `${new URL(url).origin}${link}` : link,
      image: image.startsWith("/") ? `${new URL(url).origin}${image}` : image,
      info,
      views,
      comments,
    });
  });
  return items;
}
async function getParagraphsFromURL(url) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    const $ = cheerio.load(data);
    const paragraphs = $("p")
      .map((index, element) => $(element).text().trim())
      .get();
    return paragraphs;
  } catch (error) {
    console.error("Error fetching or parsing the page:", error);
    return [];
  }
}