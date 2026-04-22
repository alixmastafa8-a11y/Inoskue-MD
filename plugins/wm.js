import { addExif } from "../lib/ملصق.js";
let handler = async (m, { conn, text }) => {
  if (!m.quoted) throw "قم بالاشارة للملصق التي تريد تغيير حقوقه يا عزيزي!";
  let stiker = false;
  try {
    let [packname, ...author] = text.split("|");
    author = (author || []).join("|");
    let mime = m.quoted.mimetype || "";
    if (!/webp/.test(mime))
      throw "قم بالاشارة للصورة التي تريد تغيير حقوقها يا عزيزي !";
    let img = await m.quoted.download();
    if (!img) throw "قم بالاشارة للملصق التي تريد تغيير حقوقه يا عزيزي!";
    stiker = await addExif(img, packname || "", author || "");
  } catch (e) {
    console.error(e);
    if (Buffer.isBuffer(e)) stiker = e;
  } finally {
    if (stiker)
      conn.sendFile(m.chat, stiker, "wm.webp", "", m, false, {
        asSticker: true,
      });
    else throw "Conversion failed";
  }
};
handler.help = ["wm"];
handler.tags = ["ملصق"];
handler.command = /^(wm|take)$/i;
handler.limit = 1
export default handler;