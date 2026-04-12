import axios from 'axios';

let handler = async (m, { text }) => {
  if (!text) return m.reply('يرجى إدخال اسم السورة');
  const surah = text.split(' ')[1];
  if (!surah) return m.reply('يرجى إدخال اسم السورة');

  try {
    const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surah}/ar.alafasy`);
    const data = response.data;
    if (data.code !== 200) return m.reply('لم يتم العثور على السورة');

    const surahData = data.data;
    let audioUrl = surahData.ayahs[0].audio;
    let msg = `سورة ${surahData.englishName} (${surahData.name})\n`;
    msg += `عدد الآيات: ${surahData.numberOfAyahs}\n\n`;
    surahData.ayahs.forEach((ayah, index) => {
      msg += `${index + 1}. ${ayah.text}\n`;
    });

    m.reply(msg);
    m.reply({ audio: { url: audioUrl }, mimetype: 'audio/mpeg' });
  } catch (e) {
    m.reply(`حدث خطأ: ${e.message}`);
  }
};

handler.help = ['سورة'];
handler.tags = ['quran'];
handler.command = ['سورة'];

export default handler;