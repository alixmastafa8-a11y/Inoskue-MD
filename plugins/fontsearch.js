import axios from 'axios';
const googleFonts = {
  api: {
    base: 'https://fontasy.co',
    endpoint: {
      fonts: '/api/google/webfonts'  
    }
  },
  headers: {
    'accept': 'application/json',
    'user-agent': 'Postify/1.0.0'
  },
  isValid: (input) => {
    if (!input) {
      return {
        valid: false,
        error: "يرجى تقديم a font name to search for."
      };
    }
    const fontx = /^[a-zA-Z0-9\s-]+$/;
    const fn = input.trim();
    if (!fontx.test(fn)) {
      return {
        valid: false,
        error: "Invalid font name format. Use only letters, numbers, spaces, or hyphens."
      };
    }
    return {
      valid: true, 
      fontName: fn
    };
  },
  get: async () => {
    try {
      const response = await axios.get(`${googleFonts.api.base}${googleFonts.api.endpoint.fonts}`, {
        headers: googleFonts.headers,
        validateStatus: false
      });
      if (!response.data || response.status !== 200) {
        return {
          success: false,
          code: response.status || 400,
          result: {
            error: response.status === 404 ? 
              "Sorry, the font data could not be found." :
              response.status === 429 ?
              "Too many requests. يرجى الانتظار a moment and try again." :
              "فشل to retrieve font data. Please try again later."
          }
        };
      }
      const fonts = response.data.items;
      const result = fonts.map(font => {
        const variants = font.variants.map(variant => ({
          name: variant,
          url: font.files[variant]
        }));
        return {
          family: {
            name: font.family,
            category: font.category,
            version: font.version,
            lastModified: font.lastModified
          },
          variants: variants,
          metadata: {
            menu: font.menu || variants[0]?.url,
            preview: font.menu,
            subsets: font.subsets,
            weights: font.weights, 
            styles: font.styles,
            popularity: font.popularity,
            trending: font.trending
          }
        };
      });
      return {
        success: true,
        code: 200,
        result: {
          total: result.length,
          fonts: result
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 400,
        result: {
          error: error?.response?.data?.message || error.message || "حدث خطأ."
        }
      };
    }
  },
  search: async (query) => {
    try {
      const validation = googleFonts.isValid(query);
      if (!validation.valid) {
        return {
          success: false,
          code: 400,
          result: {
            error: validation.error
          }
        };
      }
      const fonts = await googleFonts.get();
      if (!fonts.success) {
        return fonts;
      }
      const res = fonts.result.fonts.filter(font => 
        font.family.name.toLowerCase().includes(query.toLowerCase()) ||
        font.family.category.toLowerCase().includes(query.toLowerCase())
      );
      return {
        success: true,
        code: 200,
        result: {
          query: query,
          total: res.length,
          fonts: res
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 400,
        result: {
          error: error?.response?.data?.message || error.message || "حدث خطأ."
        }
      };
    }
  },
  category: async (type, count = 20) => {
    try {
      if (isNaN(count) || count < 1) {
        return {
          success: false,
          code: 400,
          result: {
            error: "Please request at least one font."
          }
        };
      }
      const fonts = await googleFonts.get();
      if (!fonts.success) {
        return fonts;
      }
      let result;
      if (type.toLowerCase() === 'trending') {
        result = fonts.result.fonts
          .sort((a, b) => b.metadata.trending - a.metadata.trending)
          .slice(0, count);
      } 
      else if (type.toLowerCase() === 'popular') {
        result = fonts.result.fonts
          .sort((a, b) => b.metadata.popularity - a.metadata.popularity)
          .slice(0, count);
      }
      else {
        return {
          success: false,
          code: 400,
          result: {
            error: "Invalid category. Please choose either 'trending' or 'popular'."
          }
        };
      }
      return {
        success: true,
        code: 200,
        result: {
          category: type,
          count: count,
          total: result.length,
          fonts: result
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 400,
        result: {
          error: error?.response?.data?.message || error.message || "حدث خطأ."
        }
      };
    }
  }
};
let handler = async (m, { conn }) => {
  const query = m.text.trim().split(/\s+/).slice(1).join(' ');
  if (!query) {
    return conn.reply(m.chat, 'يرجى إدخال a font name to search. مثال: !fontsearch Roboto', m);
  }
  try {
    const result = await googleFonts.search(query);
    if (!result.success) {
      return conn.reply(m.chat, result.result.error, m);
    }
    const { total, fonts } = result.result;
    if (total === 0) {
      return conn.reply(m.chat, `No fonts found for "${query}". Try a different name.`, m);
    }
    const limitedFonts = fonts.slice(0, 3);
    let response = `Search results for "${query}" (showing ${limitedFonts.length} of ${total} fonts):\n\n`;
    limitedFonts.forEach((font, index) => {
      response += `${index + 1}. ${font.family.name} (${font.family.category})\n`;
      response += `   Version: ${font.family.version}\n`;
      response += `   Variants: ${font.variants.map(v => v.name).join(', ')}\n`;
      if (font.metadata.preview) {
        response += `   Preview: ${font.metadata.preview}\n`;
      }
      response += '\n';
    });
    if (total > 3) {
      response += `...and ${total - 3} more fonts. For more details, try a more specific search!`;
    }
    await conn.reply(m.chat, response, m);
  } catch (error) {
    await conn.reply(m.chat, `حدث خطأ: ${error.message || 'Something went wrong.'}`, m);
  }
};
handler.help = ['fontsearch'];
handler.command = ['fontsearch'];
handler.tags = ['tools'];
handler.limit = true 
export default handler;