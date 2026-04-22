import axios from 'axios';
import cheerio from 'cheerio';
let handler = async (m, { conn, args, text }) => {
  if (!args[0]) {
    throw 'يرجى تقديم an Instagram username! مثال: !igstalk noureddine_ouafy';
  }
  async function igstalkv2(query) {
    const endpoint = 'https://privatephotoviewer.com/wp-json/instagram-viewer/v1/fetch-profile';
    const payload = { find: query };
    const headers = {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://privatephotoviewer.com/'
    };
    try {
      const { data } = await axios.post(endpoint, payload, { headers });
      const html = data.html;
      const $ = cheerio.load(html);
      let profilePic = $('#profile-insta').find('.col-md-4 img').attr('src');
      if (profilePic && profilePic.startsWith('//')) {
        profilePic = 'https:' + profilePic;
      }
      const name = $('#profile-insta').find('.col-md-8 h4.text-muted').text().trim();
      const username = $('#profile-insta').find('.col-md-8 h5.text-muted').text().trim();
      const stats = {};
      $('#profile-insta')
        .find('.col-md-8 .d-flex.justify-content-between.my-3 > div')
        .each((i, el) => {
          const statValue = $(el).find('strong').text().trim();
          const statLabel = $(el).find('span.text-muted').text().trim().toLowerCase();
          if (statLabel.includes('posts')) {
            stats.posts = statValue;
          } else if (statLabel.includes('followers')) {
            stats.followers = statValue;
          } else if (statLabel.includes('following')) {
            stats.following = statValue;
          }
        });
      const bio = $('#profile-insta').find('.col-md-8 p').text().trim();
      return {
        name,
        username,
        profilePic,
        posts: stats.posts,
        followers: stats.followers,
        following: stats.following,
        bio
      };
    } catch (error) {
      console.error('Error fetching Instagram profile:', error.message);
      throw new Error('فشل to fetch Instagram profile. Please try again later.');
    }
  }
  try {
    const result = await igstalkv2(args[0]);
    const response = `
*Instagram Profile: ${result.username}*
*Name:* ${result.name || 'N/A'}
*Posts:* ${result.posts || '0'}
*Followers:* ${result.followers || '0'}
*Following:* ${result.following || '0'}
*Bio:* ${result.bio || 'No bio available'}`.trim();
    if (result.profilePic) {
      await conn.sendMessage(m.chat, {
        image: { url: result.profilePic },
        caption: response
      }, { quoted: m });
    } else {
      await conn.reply(m.chat, response, m);
    }
  } catch (error) {
    await conn.reply(m.chat, error.message, m);
  }
};
handler.help = ['تتبع-انستا'];
handler.command = ['تتبع-انستا'];
handler.tags = ['search'];
handler.limit = true 
export default handler;