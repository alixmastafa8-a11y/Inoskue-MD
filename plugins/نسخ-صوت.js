import fetch from 'node-fetch';
async function getTranscript(videoUrl) {
  try {
    const response = await fetch('https://kome.ai/api/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://kome.ai',
        'Referer': 'https://kome.ai/tools/youtube-transcript-generator',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        video_id: videoUrl,
        format: true
      })
    });
    if (!response.ok) {
      throw new Error(`❌ فشل في جلب الترجمة! الحالة: ${response.status}`);
    }
    const data = await response.json();
    if (!data.transcript) {
      throw new Error('❌ لا يوجد نص مترجم متاح للفيديو.');
    }
    return data.transcript;
  } catch (err) {
    return `❌ خطأ: ${err.message}`;
  }
}
let handler = async (m, { text, conn }) => {
  if (!text) throw '✳️ أرسل رابط فيديو يوتيوب:\nمثال: .transcript https://youtu.be/xxx';
  const result = await getTranscript(text);
  await m.reply(`📄 *نص الفيديو:*\n\n${result}`);
};
handler.help = ['نسخ-صوت'];
handler.command = ['نسخ-صوت'];
handler.tags = ['tools'];
handler.limit = true;
export default handler;