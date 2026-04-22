import axios from 'axios';
import qs from 'qs';
const gistlib = {
  api: {
    base: "https://api.gistlib.com/v1/prompt/query",
    token: "https://securetoken.googleapis.com/v1/token",
    userInfo: "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo",
    key: "AIzaSyABSb80nLRB_FN2bdZrtIV5k7_oLRMQF9w"
  },
  headers: {
    'authority': 'api.gistlib.com',
    'accept': 'application/json, text/plain, */*',
    'origin': 'https://gistlib.com',
    'pragma': 'no-cache',
    'referer': 'https://gistlib.com/',
    'user-agent': 'Postify/1.0.0'
  },
  languages: [
    'javascript',
    'typescript',
    'python',
    'swift',
    'ruby',
    'csharp',
    'go',
    'rust',
    'php',
    'matlab',
    'r'
  ],
  refreshToken: 'AMf-vBxj8NY808dvIjtCj_1UzVZvqjiYAKwiDJHrd_CN7S9tfb9z8i9rQgn4JqpJ88mCD_bgYxP4mSwQEU341_2mzI5rNGD5RiRXnpMxvIxLLWSZz2Ofhf9tz3Lc31mGCeb3dLnwKr7XiSK89Sc77yS8ZqzXYGYJhEptXsm5XqNQHoX_St101c4',
  a: {
    token: null,
    expiresAt: null
  },
  async ensureToken() {
    const now = Date.now();
    if (this.a.token && this.a.expiresAt && now < this.a.expiresAt - 300000) {
      return {
        success: true,
        code: 200,
        result: {
          token: this.a.token
        }
      };
    }
    try {
      const data = {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      };
      const response = await axios.post(
        `${this.api.token}?key=${this.api.key}`,
        qs.stringify(data),
        { headers: this.headers }
      );
      if (!response.data?.access_token) {
        return {
          success: false,
          code: 400,
          result: {
            error: "Your token is invalid, are you trying to cheat? 🤣"
          }
        };
      }
      this.a = {
        token: response.data.access_token,
        expiresAt: now + (response.data.expires_in * 1000 || 3600000)
      };
      return {
        success: true,
        code: 200,
        result: {
          token: this.a.token
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error.response?.status || 500,
        result: {
          error: "Yeah, I see 🙈 The token couldn't be fetched, bro, you're playing dirty, huh..."
        }
      };
    }
  },
  isValid: (data) => {
    if (!data) {
      return {
        success: false,
        code: 400,
        result: {
          error: "There's no data, bro! What did you input? 🗿"
        }
      };
    }
    if (!data.prompt) {
      return {
        success: false,
        code: 400,
        result: {
          error: "Where's the prompt, bro? If you're serious, don't leave it empty like that 🫵🏻"
        }
      };
    }
    if (!data.language) {
      return {
        success: false,
        code: 400,
        result: {
          error: "Where's the language, bro? Don't leave it empty like that... You think I know what language you want to use? 🗿 Maybe Javanese? :v"
        }
      };
    }
    if (!gistlib.languages.includes(data.language.toLowerCase())) {
      return {
        success: false,
        code: 400,
        result: {
          error: `What's this '${data.language}' language, bro? Get it right, man... Here are the supported languages: ${gistlib.languages.join(', ')} 😑`
        }
      };
    }
    return {
      success: true,
      code: 200,
      result: {
        message: "The data is valid, bro 💃🏻"
      }
    };
  },
  create: async (prompt, language) => {
    const validation = gistlib.isValid({ prompt, language });
    if (!validation.success) {
      return validation;
    }
    const ab = await gistlib.ensureToken();
    if (!ab.success) {
      return ab;
    }
    try {
      const response = await axios.get(gistlib.api.base, {
        headers: {
          ...gistlib.headers,
          'Authorization': `Bearer ${ab.result.token}`
        },
        params: { prompt, language }
      });
      return {
        success: true,
        code: 200,
        result: response.data
      };
    } catch (error) {
      return {
        success: false,
        code: error.response?.status || 500,
        result: {
          error: "Oh no... Gistlib's server is acting up, bro 😌",
          details: error.message
        }
      };
    }
  }
};
const handler = async (m, { conn, text }) => {
  const [language, ...promptArray] = text.split(' ');
  const prompt = promptArray.join(' ');
  if (!language || !prompt) {
    return m.reply('Usage example: .code javascript create a fibonacci function \n\n*List of Programming Languages: \n\n- javascript\n\n- python\n\n- ruby\n\n- php\n\n- matlab\n\n- go\n\n- swift\n\n- csharp\n\n- r\n\n- typescript\n\n- rust');
  }
  const result = await gistlib.create(prompt, language.toLowerCase());
  if (!result.success) {
    return m.reply(`${result.result.error || 'Error'}`);
  }
  const codeResult = result.result;
  let responseText = `*Result Code ${language.toUpperCase()}*:\n\n`;
  responseText += `${codeResult.language}\n\n${codeResult.code}`;
  m.reply(responseText);
};
handler.help = ['gistlib'];
handler.command = ['gistlib'];
handler.tags = ['ai'];
handler.limit = true 
export default handler;