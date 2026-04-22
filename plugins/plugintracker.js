import axios from 'axios';
const GITHUB_USER   = 'noureddineouafy';
const GITHUB_REPO   = 'silana-lite-ofc';
const GITHUB_BRANCH = 'master';
const PLUGINS_PATH  = 'plugins';
const GITHUB_TOKEN = ''; 
const REPO_URL = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/${GITHUB_BRANCH}/${PLUGINS_PATH}`;
const DAY_NAMES = {
  0: { ar: 'الأحد',     en: 'Sunday'    },
  1: { ar: 'الإثنين',   en: 'Monday'    },
  2: { ar: 'الثلاثاء',  en: 'Tuesday'   },
  3: { ar: 'الأربعاء',  en: 'Wednesday' },
  4: { ar: 'الخميس',    en: 'Thursday'  },
  5: { ar: 'الجمعة',    en: 'Friday'    },
  6: { ar: 'السبت',     en: 'Saturday'  },
};
function buildHeaders() {
  const h = { 'user-agent': 'Mozilla/5.0', accept: 'application/vnd.github+json' };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}
function fmtDate(d) {
  return d.toLocaleDateString('fr-MA');
}
function fmtTime(d) {
  return d.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });
}
function dayKey(d) {
  return d.toISOString().slice(0, 10);
}
function isToday(d) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth()    === now.getMonth()    &&
         d.getDate()     === now.getDate();
}
async function getNewPluginsSince(days = 1) {
  const headers = buildHeaders();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const commitsUrl =
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits` +
    `?sha=${GITHUB_BRANCH}&path=${PLUGINS_PATH}&since=${since.toISOString()}&per_page=100`;
  const { data: commits } = await axios.get(commitsUrl, { timeout: 20000, headers });
  if (!commits.length) return new Map();
  const byDay = new Map();
  for (const c of commits) {
    const { data: detail } = await axios.get(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits/${c.sha}`,
      { timeout: 20000, headers }
    );
    const date      = new Date(detail.commit.author.date);
    const commitMsg = detail.commit.message.split('\n')[0].trim();
    const key       = dayKey(date);
    for (const file of detail.files || []) {
      if (file.status !== 'added') continue;
      if (!file.filename.startsWith(PLUGINS_PATH + '/')) continue;
      const name = file.filename.slice(PLUGINS_PATH.length + 1);
      if (name.includes('/')) continue; 
      if (!byDay.has(key)) byDay.set(key, []);
      const dayList = byDay.get(key);
      if (!dayList.find(p => p.name === name)) {
        dayList.push({ name, date, commitMsg });
      }
    }
  }
  for (const [, list] of byDay) {
    list.sort((a, b) => b.date - a.date);
  }
  return new Map([...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}
function formatMessage(byDay, days) {
  const totalPlugins = [...byDay.values()].reduce((s, l) => s + l.length, 0);
  const label        = days === 1 ? 'اليوم / Today' : `آخر ${days} أيام / Last ${days} days`;
  if (!totalPlugins) {
    return (
`😴 *ما زادش نورالدين والو!*
*No new plugins added!*
• *الفترة / Period:* ${label}
• *Repo:* ${GITHUB_USER}/${GITHUB_REPO}
🔗 ${REPO_URL}`
    );
  }
  let msg = '';
  msg += `╔══════════════════════════╗\n`;
  msg += `║   🆕 بلوغينات جديدة      ║\n`;
  msg += `║   New Plugins Added      ║\n`;
  msg += `╚══════════════════════════╝\n\n`;
  msg += `📁 *${GITHUB_USER}/${GITHUB_REPO}*\n`;
  msg += `📅 *${label}*\n`;
  msg += `📦 *المجموع / Total: ${totalPlugins} plugin${totalPlugins > 1 ? 's' : ''}*\n`;
  msg += `${'─'.repeat(30)}\n\n`;
  for (const [key, plugins] of byDay) {
    const d       = new Date(key + 'T12:00:00Z');
    const dayNum  = d.getUTCDay();
    const dayAr   = DAY_NAMES[dayNum].ar;
    const dayEn   = DAY_NAMES[dayNum].en;
    const todayBadge = isToday(new Date(key + 'T12:00:00')) ? ' ◀ اليوم' : '';
    msg += `📆 *${dayAr} / ${dayEn} — ${fmtDate(new Date(key + 'T12:00:00Z'))}${todayBadge}*\n`;
    msg += `   ${plugins.length} plugin${plugins.length > 1 ? 's' : ''}\n`;
    msg += `${'┄'.repeat(28)}\n`;
    plugins.forEach((p, i) => {
      msg += `  *${i + 1}.* \`${p.name}\`\n`;
      msg += `       🕐 ${fmtTime(p.date)}\n`;
      msg += `       💬 ${p.commitMsg}\n`;
    });
    msg += '\n';
  }
  msg += `${'─'.repeat(30)}\n`;
  msg += `🔗 ${REPO_URL}`;
  return msg;
}
let handler = async (m, { text }) => {
  const arg = String(text || '').trim().toLowerCase();
  let days;
  if (arg === 'week' || arg === 'أسبوع' || arg === 'اسبوع') {
    days = 7;
  } else if (arg && !isNaN(parseInt(arg))) {
    days = Math.min(30, Math.max(1, parseInt(arg))); 
  } else {
    days = 1;
  }
  const label = days === 7 ? 'الأسبوع / Week'
              : days === 1 ? 'اليوم / Today'
              : `آخر ${days} أيام / Last ${days} days`;
  await m.reply(`🔍 كانبحث على بلوغينات نورالدين (${label})...`);
  let byDay;
  try {
    byDay = await getNewPluginsSince(days);
  } catch (e) {
    if (e?.response?.status === 403) {
      return m.reply(
`⚠️ *GitHub API rate limit reached!*
وصلنا لحد الطلبات ديال GitHub.
[EN] Add a GitHub token in the plugin config to fix this.
[AR] أضف GitHub Token في إعدادات البلوغين لحل المشكلة.
🔗 https://github.com/settings/tokens`
      );
    }
    return m.reply(`❌ GitHub API error: ${e.message}`);
  }
  return m.reply(formatMessage(byDay, days));
};
handler.help = ['plugintracker'];
handler.tags    = ['owner', 'tools'];
handler.command = ['plugintracker'];
export default handler;