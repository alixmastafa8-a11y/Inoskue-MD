let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🔍 اكتب كلمة للبحث عنها في Pinterest.\nمثال: .pint furina');
  try {
    const results = await pint(text);
    if (!results || results.length === 0) {
      return m.reply('❌ لم يتم العثور على نتائج، حاول بكلمة أخرى.');
    }
    await conn.sendFile(m.chat, results[0], 'result.jpg', `✅ نتيجة البحث عن: *${text}*`, m);
  } catch (err) {
    console.error(err);
    m.reply('⚠️ حدث خطأ أثناء البحث، حاول لاحقاً.');
  }
};
handler.help = handler.command = ['بنتريست'];
handler.tags = ['search'];
handler.limit = true;
export default handler;
let pint = async (query) => {
  const response = await fetch(
    "https://www.pinterest.com/resource/BaseSearchResource/get/?data=" +
      encodeURIComponent(
        '{"options":{"query":"' + encodeURIComponent(query) + '"}}'
      ),
    {
      headers: {
        "screen-dpr": "4",
        "x-pinterest-pws-handler": "www/search/[scope].js",
      },
      method: "head",
    }
  );
  if (!response.ok)
    throw Error(`خطأ في الاتصال: ${response.status} ${response.statusText}`);
  const rhl = response.headers.get("Link");
  if (!rhl) throw Error(`❌ لم يتم العثور على نتائج لكلمة: ${query}`);
  const links = [...rhl.matchAll(/<(.*?)>/gm)].map((v) => v[1]);
  return links;
};