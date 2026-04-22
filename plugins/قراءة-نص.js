import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
const handler = async (m, { conn }) => {
  const performOCR = async (imagePath) => {
    const form = new FormData();
    form.append('apikey', 'K81241004488957');
    form.append('file', fs.createReadStream(imagePath));
    form.append('language', 'eng');
    const response = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders(),
    });
    if (response.data.OCRExitCode !== 1) {
      throw new Error('فشل to perform OCR. Check the image or API key.');
    }
    return response.data.ParsedResults[0]?.ParsedText || 'No text detected in the image.';
  };
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) throw 'رد علىn image using the .ocr command.';
  if (!/image\/(jpe?g|png)/.test(mime)) throw `Unsupported image type: ${mime}`;
  try {
    const img = await q.download();
    if (!img) throw 'فشل to download the image.';
    const tempPath = './temp_image.jpg';
    fs.writeFileSync(tempPath, img);
    const textResult = await performOCR(tempPath);
    await m.reply(textResult);
    fs.unlinkSync(tempPath);
  } catch (err) {
    throw `حدث خطأ: ${err.message || err}`;
  }
};
handler.help = ['قراءة-نص'];
handler.tags = ['tools'];
handler.command = /^(ocr)$/i;
handler.limit = true;
export default handler;