import axios from "axios";
import FormData from "form-data";
async function ihancer(buffer, { method = 1, size = "low" } = {}) {
  const availableSizes = ["low", "medium", "high"];
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Image buffer is required");
  }
  if (method < 1 || method > 4) {
    throw new Error("Available methods: 1, 2, 3, 4");
  }
  if (!availableSizes.includes(size)) {
    throw new Error(`Available sizes: ${availableSizes.join(", ")}`);
  }
  const form = new FormData();
  form.append("method", method.toString());
  form.append("is_pro_version", "false");
  form.append("is_enhancing_more", "false");
  form.append("max_image_size", size);
  form.append("file", buffer, `${Date.now()}.jpg`);
  const response = await axios.post(
    "https://ihancer.com/api/enhance",
    form,
    {
      headers: {
        ...form.getHeaders(),
        "accept-encoding": "gzip",
        host: "ihancer.com",
        "user-agent": "Dart/3.5 (dart:io)",
      },
      responseType: "arraybuffer",
    }
  );
  return Buffer.from(response.data);
}
let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";
  if (!mime) {
    throw `
🖼️ *HD Image Enhancer*
This feature enhances your image quality and makes it clearer.
📌 How to use:
1. Send or reply to an image
2. Type: ${usedPrefix + command}
مثال:
• Reply to image → ${usedPrefix + command}
Supported formats:
• JPG
• JPEG
• PNG
`;
  }
  if (!/image\/(jpe?g|png)/.test(mime)) {
    throw `❌ Unsupported file type: ${mime}\nOnly JPG and PNG images are supported.`;
  }
  m.react("⏳");
  try {
    const img = await q.download();
    const result = await ihancer(img, { method: 1, size: "high" });
    await conn.sendFile(m.chat, result, "hd.jpg", "✨ Image successfully enhanced!", m);
    m.react("✅");
  } catch (err) {
    console.error(err);
    m.react("❌");
    throw "فشل to enhance image. Please try again later.";
  }
};
handler.help = handler.command = ["remini"];
handler.tags = ["editor"];
handler.limit = 2;
export default handler;