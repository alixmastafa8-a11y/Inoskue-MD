import axios from 'axios';
import FormData from 'form-data';
async function performOcr(imageBuffer) {
  if (!imageBuffer) {
    throw new Error('لم يتم توفير بيانات الصورة.');
  }
  try {
    const form = new FormData();
    form.append('file', imageBuffer, { filename: 'image.jpg' });
    form.append('language', 'ara'); 
    form.append('isOverlayRequired', 'false');
    form.append('OCREngine', '1'); 
    const { data } = await axios.post('https://api8.ocr.space/parse/image', form, {
      headers: {
        ...form.getHeaders(),
        'Apikey': 'donotstealthiskey_ip1',
      },
      timeout: 45000, 
    });
    if (data.IsErroredOnجارٍ المعالجة) {
      throw new Error(data.ErrorMessage.join('\n'));
    }
    const parsedText = data.ParsedResults?.[0]?.ParsedText;
    if (!parsedText || parsedText.trim() === '') {
      throw new Error('تعذر استخراج النص من الصورة. قد تكون الصورة فارغة أو غير واضحة.');
    }
    return parsedText;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(error.response ? `API خطأ: ${JSON.stringify(error.response.data)}` : error.message);
  }
}
let handler = async (m, { conn }) => {
  const quoted = m.quoted ? m.quoted : m;
  const mime = (quoted.msg || quoted).mimetype || '';
  if (!/image/.test(mime)) {
    return m.reply('يرجى الرد على صورة مع الأمر لقراءة النص الموجود بها. 🖼️');
  }
  try {
    await m.reply('🔍 جاري قراءة النص من الصورة، يرجى الانتظار...');
    const imgBuffer = await quoted.download();
    if (!imgBuffer) {
      throw new Error('فشل تحميل الصورة.');
    }
    const text = await performOcr(imgBuffer);
    await m.reply(text.trim());
  } catch (e) {
    await m.reply(`❌ حدث خطأ:\n${e.message}`);
  }
};
handler.help = ['totext'];
handler.command = ['totext'];
handler.tags = ['tools'];
handler.limit = true; 
export default handler;