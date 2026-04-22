import axios from 'axios';
import * as cheerio from 'cheerio';
const gmailProfile = {
  check: async function(email) {
    try {
      const username = email.split('@')[0];
      const { data } = await axios.post('https://gmail-osint.activetk.jp/', new URLSearchParams({ q: username, domain: 'gmail.com' }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Postify/1.0.0' }
      });
      const $ = cheerio.load(data);
      const text = $('pre').text();
      return {
        photoProfile: this.extract(text, /Custom profile picture !\s*=>\s*(.*)/, 'No photo'),
        email,
        lastEditProfile: this.extract(text, /Last profile edit : (.*)/),
        googleID: this.extract(text, /Gaia ID : (.*)/),
        userTypes: this.extract(text, /User types : (.*)/),
        googleChat: {
          entityType: this.extract(text, /Entity Type : (.*)/),
          customerID: this.extract(text, /Customer ID : (.*)/, 'No ID', true),
        },
        googlePlus: {
          enterpriseUser: this.extract(text, /Entreprise User : (.*)/),
        },
        mapsData: {
          profilePage: this.extract(text, /Profile page : (.*)/),
        },
        ipAddress: text.includes('Your IP has been blocked by Google') ? 'Blocked by Google' : 'Safe',
        calendar: text.includes('No public Google Calendar') ? 'None' : 'Available'
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  extract: function(text, regex, defaultValue = 'No data', checkNotFound = false) {
    const result = (text.match(regex) || [null, defaultValue])[1].trim();
    return checkNotFound && result === 'Not found.' ? 'No data' : result;
  }
};
let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, 'يرجى تقديم a valid email to check!', m);
  }
  const result = await gmailProfile.check(text);
  const profileInfo = `
    *Email:* ${result.email}
    *Profile Picture:* ${result.photoProfile}
    *Last Profile Edit:* ${result.lastEditProfile}
    *Google ID:* ${result.googleID}
    *User Types:* ${result.userTypes}
    *Google Chat Entity Type:* ${result.googleChat.entityType}
    *Google Chat Customer ID:* ${result.googleChat.customerID}
    *Google Plus Enterprise User:* ${result.googlePlus.enterpriseUser}
    *Maps Profile Page:* ${result.mapsData.profilePage}
    *IP Address Status:* ${result.ipAddress}
    *Google Calendar:* ${result.calendar}
  `;
  return conn.reply(m.chat, profileInfo, m);
};
handler.help = handler.command = ['gmailprofile'];
handler.tags = ['tools'];
handler.limit = true 
export default handler;