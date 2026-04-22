import axios from "axios";
import FormData from "form-data";
class ApiClient {
  constructor(baseUrl = "https://loadbalancer.dalliegenerator.app") {
    this.BASE_URL = baseUrl;
  }
  _toBuffer(input) {
    if (Buffer.isBuffer(input)) return input;
    if (typeof input === "string") {
      const match = input.match(/^data:image\/(.+?);base64,(.*)$/);
      const base64String = match ? match[2] : input;
      if (base64String.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(base64String)) {
        try {
          return Buffer.from(base64String, "base64");
        } catch (e) {
          console.warn("[Helper] Konversi string ke buffer gagal (Base64 tidak valid).");
          return null;
        }
      }
    }
    return null;
  }
  async generate({
    imageUrl, 
    ...rest
  }) {
    if (!imageUrl) throw new Error("Input image harus disediakan.");
    const path = "/images/remove-bg";
    const url = `${this.BASE_URL}${path}`;
    try {
      console.log(`[API] Mulai proses hapus latar belakang ke ${path}...`);
      const form = new FormData();
      let fileBuffer = this._toBuffer(imageUrl);
      let filename = `image_${Date.now()}.jpg`;
      let mimeType = "image/jpeg";
      let uploadSource = "Base64/Buffer";
      if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
        uploadSource = "URL Dikonversi";
        console.log(`[API] Mengambil gambar dari URL...`);
        const imgResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer"
        });
        fileBuffer = Buffer.from(imgResponse.data);
        filename = imageUrl.split("/").pop()?.split("?")[0] || filename;
        mimeType = imgResponse.headers["content-type"] || mimeType;
      } else if (!fileBuffer) {
        throw new Error("Format input tidak valid (bukan URL, Base64, atau Buffer).");
      }
      console.log(`[API] Mengunggah gambar (${uploadSource}) ke ${path}...`);
      form.append("file", fileBuffer, {
        filename: filename,
        contentType: mimeType
      });
      Object.keys(rest).forEach(key => {
        form.append(key, rest[key]);
      });
      const response = await axios.post(url, form, {
        headers: form.getHeaders()
      });
      const responseData = response.data || {};
      const base64Image = responseData.image_base64 || responseData.image_base64_encoded;
      if (!base64Image || typeof base64Image !== "string") {
        console.error("[API ERROR] Respons API tidak mengandung data gambar Base64.");
        throw new Error("Remove BG failed: Data Base64 tidak ditemukan.");
      }
      const imageBuffer = Buffer.from(base64Image, "base64");
      console.log(`[API] Berhasil! Mengkonversi Base64 ke Buffer.`);
      return {
        resultBuffer: imageBuffer,
        length: imageBuffer.length,
        contentType: "image/png"
      };
    } catch (error) {
      const status = error.response?.status || "N/A";
      const msg = error.response?.data?.message || error.message || "Unknown Error";
      console.error(`[API ERROR] Gagal (Status: ${status}): ${msg}`);
      throw new Error(`Remove BG failed: ${msg}`);
    }
  }
}
let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime.startsWith('image')) {
        throw `⚠️ Please reply to an image or send an image with the caption *${usedPrefix + command}*`;
    }
    m.reply('⏳ *جارٍ المعالجة background removal...* يرجى الانتظار.');
    try {
        let media = await q.download();
        const client = new ApiClient();
        const result = await client.generate({ 
            imageUrl: media 
        });
        await conn.sendMessage(m.chat, { 
            image: result.resultBuffer, 
            caption: '✅ *Background Removed نجحfully*' 
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply(`❌ *Error:* ${e.message}`);
    }
}
handler.help = ['ازالة-خلفية']
handler.tags = ['editor']
handler.command = /^(removebg)$/i
handler.limit = true;
export default handler