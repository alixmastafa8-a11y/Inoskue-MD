import axios from 'axios';
const fstik = {
  api: {
    base: 'https://api.fstik.app',
    endpoints: {
      direct: '/getStickerSetByName',
      search: '/searchStickerSet'
    }
  },
  headers: {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'origin': 'https://webapp.fstik.app',
    'referer': 'https://webapp.fstik.app/',
    'user-agent': 'NB Android/1.0.0'
  },
  name: async (name) => {
    if (!name || typeof name !== 'string') {
      return {
        success: false,
        code: 400,
        result: {
          error: 'Inputnya kagak boleh kosong bree 🗿'
        }
      };
    }
    try {
      const res = await axios.post(
        fstik.api.base + fstik.api.endpoints.direct, {
          name,
          user_token: null
        }, {
          headers: fstik.headers
        }
      );
      const set = res.data?.result;
      if (!set) {
        return {
          success: false,
          code: 404,
          result: {
            error: `Sticker set "${name}" mah kagak ada bree... 🤙🏻`
          }
        };
      }
      return {
        success: true,
        code: 200,
        result: {
          source: 'database',
          id: set.id,
          title: set.title,
          name: set.name,
          description: set.description,
          tags: set.tags,
          kind: set.kind,
          type: set.type,
          public: set.public,
          safe: set.safe,
          verified: set.verified,
          reaction: set.reaction,
          installations: set.installations,
          ملصقCount: set.ملصقs?.length || 0,
          ملصقs: set.ملصقs?.map((s, i) => {
            const file_id = s.file_id ?? s.fileid;
            const thumb_id = s.thumb?.file_id ?? s.thumb?.fileid;
            return {
              index: i + 1,
              file_id,
              thumb_id,
              size: `${s.width}x${s.height}`,
              image_url: thumb_id ? `${fstik.api.base}/file/${thumb_id}/ملصق.webp` : null
            };
          })
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err?.response?.status || 500,
        result: {
          error: 'Error bree 🫵🏻😂',
          details: err.message
        }
      };
    }
  },
  search: async ({
    query = '',
    skip = 0,
    limit = 15,
    type = '',
    kind = 'regular'
  }) => {
    try {
      const payload = {
        query,
        skip,
        limit,
        type,
        kind,
        user_token: null
      };
      const res = await axios.post(
        fstik.api.base + fstik.api.endpoints.search,
        payload, {
          headers: fstik.headers
        }
      );
      const sets = res.data?.result?.ملصقSets;
      if (!sets || sets.length === 0) {
        return {
          success: false,
          code: 404,
          result: {
            error: 'Sticker setnya kagak ada bree.. coba lagi nanti yak 😂🫵🏻'
          }
        };
      }
      return {
        success: true,
        code: 200,
        result: sets.map((set, i) => ({
          index: i + skip + 1,
          id: set.id,
          name: set.name,
          title: set.title,
          description: set.description,
          tags: set.tags,
          kind: set.kind,
          type: set.type,
          public: set.public,
          safe: set.safe,
          verified: set.verified,
          reaction: set.reaction,
          installations: set.installations,
          ملصقCount: set.ملصقs?.length || 0,
          ملصقs: set.ملصقs?.map((s, j) => {
            const file_id = s.file_id ?? s.fileid;
            const thumb_id = s.thumb?.file_id ?? s.thumb?.fileid;
            return {
              index: j + 1,
              file_id,
              thumb_id,
              size: `${s.width}x${s.height}`,
              image_url: thumb_id ? `${fstik.api.base}/file/${thumb_id}/ملصق.webp` : null
            };
          })
        }))
      };
    } catch (err) {
      return {
        success: false,
        code: err?.response?.status || 500,
        result: {
          error: 'Kagak bisa nyari ملصق nya bree.. 🤙🏻',
          details: err.message
        }
      };
    }
  },
  lookup: async (input) => {
    if (!input || typeof input !== 'string') {
      return {
        success: false,
        code: 400,
        result: {
          error: 'Inputnya kagak boleh kosong bree 🗿'
        }
      };
    }
    let name = input.trim();
    const isLink = input.startsWith('https://t.me/addملصقs/');
    if (isLink) {
      try {
        const url = new URL(name);
        name = url.pathname.replace('/addملصقs/', '').trim();
        const direct = await fstik.name(name);
        if (direct.success) return direct;
      } catch {
        return {
          success: false,
          code: 400,
          result: {
            error: 'Link telegramnya kagak valid bree... '
          }
        };
      }
    }
    return await fstik.search({
      query: name,
      type: '',
      kind: 'regular'
    });
  }
};
const handler = async (m, {
  text,
  usedPrefix,
  command
}) => {
  if (!text) throw `*يرجى تقديم a search query or a Telegram ملصق link.*\n*مثال:* ${usedPrefix + command} cute cat`;
  await m.reply('*Searching for ملصق packs...* 🕵️‍♂️');
  try {
    const response = await fstik.lookup(text);
    if (!response.success || (Array.isArray(response.result) && response.result.length === 0)) {
      throw new Error(response.result.error || 'No ملصق packs found for your query. 🤷‍♂️');
    }
    const results = Array.isArray(response.result) ? response.result : [response.result];
    let replyMsg = `*🔍 Found ${results.length} ملصق pack(s) for "${text}"*\n\n`;
    replyMsg += results.map((set, index) =>
      `*${index + 1}. ${set.title}*\n` +
      `*Stickers:* ${set.ملصقCount}\n` +
      `*Link:* https://t.me/addملصقs/${set.name}`
    ).join('\n\n---\n\n');
    await m.reply(replyMsg);
  } catch (e) {
    await m.reply(`*Error:* ${e.message}`);
  }
};
handler.help = handler.command = ['telegramsearch'];
handler.tags = ['ملصق'];
handler.limit = true;
export default handler;