import axios from 'axios';

const AA_URL = 'https://www.alarabiya.net/';
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
  'accept-language': 'ar,en;q=0.9',
  'accept': 'text/html,application/xhtml+xml'
};

// ═══════════════════════════════════════════════════════════════════════════
// SCRAPE — extract breaking news from Al Arabiya homepage
// ═══════════════════════════════════════════════════════════════════════════
async function getBreakingNews() {
  const { data: html } = await axios.get(AA_URL, { timeout: 20000, headers: HEADERS });
  const results = {
    mainHeadline: null, // عنوان عاجل الرئيسي
    liveUpdates: [], // تحديثات التغطية المباشرة
    liveUrl: null // رابط التغطية المباشرة
  };

  // ── 1. Main "عاجل" headline ──────────────────────────────────────────
  const mainRe = /<h2[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]+?)<\/a>\s*<\/h2>/;
  const mainMatch = html.match(mainRe);
  if (mainMatch) {
    results.mainHeadline = mainMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    results.liveUrl = 'https://www.alarabiya.net' + mainMatch[1];
  }

  // ── 2. Live updates (التغطية المباشرة bullet points) ─────────────────
  const updateRe = /<li[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]+?)<\/a>\s*<\/li>/g;
  let match;
  while ((match = updateRe.exec(html)) !== null && results.liveUpdates.length < 8) {
    const title = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (title && title.length > 10) {
      results.liveUpdates.push(title);
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT message
// ═══════════════════════════════════════════════════════════════════════════
function formatMessage(data) {
  const now = new Date().toLocaleString('ar-MA', {
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  let msg = '';
  msg += `🔴 *أخبار عاجلة — العربية نت*\n`;
  msg += `📅 ${now}\n`;
  msg += `${'━'.repeat(30)}\n\n`;
  if (data.mainHeadline) {
    msg += `📌 *الخبر الرئيسي:*\n`;
    msg += `${data.mainHeadline}\n\n`;
  }
  if (data.liveUpdates.length > 0) {
    msg += `📡 *آخر تحديثات التغطية المباشرة:*\n`;
    msg += `${'┄'.repeat(28)}\n`;
    data.liveUpdates.forEach((item, i) => {
      msg += `${i + 1}. ${item}\n\n`;
    });
  }
  if (!data.mainHeadline && !data.liveUpdates.length) {
    msg += `😴 لا توجد أخبار عاجلة حالياً\n`;
    msg += `No breaking news at the moment.\n`;
  }
  msg += `${'━'.repeat(30)}\n`;
  msg += `🔗 alarabiya.net`;
  if (data.liveUrl) msg += `\n📺 ${data.liveUrl}`;
  return msg;
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════
let handler = async (m) => {
  await m.reply(`⏳ جاري جلب الأخبار العاجلة من العربية...`);
  let data;
  try {
    data = await getBreakingNews();
  } catch (e) {
    return m.reply(`❌ فشل الاتصال بالعربية نت:\n${e.message}`);
  }
  return m.reply(formatMessage(data));
};

handler.help = ['arabic'];
handler.tags = ['morocco'];
handler.command = ['arabic'];

export default handler;