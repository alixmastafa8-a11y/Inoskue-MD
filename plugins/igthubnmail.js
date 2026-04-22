import axios from 'axios';
import cheerio from 'cheerio';
import FormData from 'form-data';
const handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    const msg = `تحميل الصورة المصغرة لأي فيديو على الإنستغرام 
 \n*.igthubnmail* https://www.instagram.com/reel/CzR1mHBNA-t`;
    let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw msg;
    await conn.reply(m.chat, wait, m);
    try {
        const data = await getImageLinks(text);
        if (data.length === 0) {
            return m.reply("لا نتيجة")
        } else {
            for (let i = 0; i < data.length; i++) {
                await conn.sendFile(m.chat, data[i], '', `instagram.com/noureddine_ouafy *(${i + 1}/${data.length})*`, m, false, {
                    mentions: [m.sender]
                });
            }
        }
    } catch (error) {
        await conn.reply(m.chat, eror, m);
    }
};
handler.help = ["igthubnmail"];
handler.tags = ["downloader"];
handler.command = /^(igthubnmail)$/i;
handler.limit = true 
export default handler;
const decryptSnapSave = (data) => {
  const [h, u, n, t, e, r] = data.split("decodeURIComponent(escape(r))}(")[1].split("))")[0].split(",").map((v) => v.replace(/"/g, "").trim());
  const g = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
  const decode = (d, e, f) => {
    const h = g.slice(0, e);
    const i = g.slice(0, f);
    let j = d.split("").reverse().reduce((a, b, c) => (h.indexOf(b) !== -1) ? (a += h.indexOf(b) * Math.pow(e, c)) : a, 0);
    let k = "";
    while (j > 0) {
      k = i[j % f] + k;
      j = (j - (j % f)) / f;
    }
    return k || "0";
  }
  let result = "";
  for (let i = 0, len = h.length; i < len; i++) {
    let s = "";
    while (h[i] !== n[e]) {
      s += h[i];
      i++;
    }
    for (let j = 0; j < n.length; j++)
      s = s.replace(new RegExp(n[j], "g"), j.toString());
    result += String.fromCharCode(decode(s, e, 10) - t);
  }
  return decodeURIComponent(encodeURIComponent(result));
};
function extractHtmlTags(inputString) {
  return inputString.replace(/\\/g, '').match(/<[^>]+>/g) || [];
}
const getImageLinks = async (url) => {
  const formData = new FormData();
  formData.append("url", url);
  const headers = {
    authority: "snapsave.app",
    accept: "*