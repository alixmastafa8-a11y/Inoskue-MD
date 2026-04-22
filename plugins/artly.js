import axios from 'axios';
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const artly = {
    api: {
      base: 'https://getimg-x4mrsuupda-uc.a.run.app',
      endpoint: {
        generate: '/api-premium',
      }
    },
    headers: {
      'user-agent': 'NB Android/1.0.0',
      'accept-encoding': 'gzip',
      'content-type': 'application/x-www-form-urlencoded'
    },
    generate: async (prompt = '', width = 512, height = 512, steps = 25) => {
      if (!prompt.trim()) {
        return {
          success: false,
          code: 400,
          result: {
            error: 'Prompt cannot be empty. 🗿'
          }
        };
      }
      try {
        const payload = new URLSearchParams();
        payload.append('prompt', prompt);
        payload.append('width', width.toString());
        payload.append('height', height.toString());
        payload.append('num_inference_steps', steps.toString());
        const response = await axios.post(`${artly.api.base}${artly.api.endpoint.generate}`, payload, {
          headers: artly.headers
        });
        const data = response.data;
        return {
          success: true,
          code: 200,
          result: {
            seed: data.seed,
            cost: data.cost,
            url: data.url
          }
        };
      } catch (err) {
        return {
          success: false,
          code: err.response?.status || 500,
          result: {
            error: 'حدث خطأ during generation. 🗿'
          }
        };
      }
    },
  };
  if (command === 'artly') {
    if (!text) throw `طريقة الاستخدام: ${usedPrefix + command} <prompt>\nمثال: ${usedPrefix + command} a cat wearing a hat`;
    await m.reply('Generating your image, please wait...');
    const result = await artly.generate(text);
    if (result.success) {
      await conn.sendFile(m.chat, result.result.url, 'artly.png', `*Seed:* ${result.result.seed}\n*Cost:* ${result.result.cost}`, m);
    } else {
      await m.reply(`خطأ: ${result.result.error} (Code: ${result.code})`);
    }
  }
};
handler.help = ['artly'];
handler.command = ['artly'];
handler.tags = ['ai'];
handler.limit = true; 
export default handler;