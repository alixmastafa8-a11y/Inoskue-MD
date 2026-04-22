import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";
const cif = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    if (!mime) return m.reply("No media found");
    let media = await q.download();
    let link = await uploadToCatbox(media);
    let caption = `📮 *L I N K :*
${link}
📊 *S I Z E :* ${formatBytes(media.length)}
📛 *E x p i r e d :* "No Expiry Date"`;
    await m.reply(caption);
};
cif.command = ['tourl'];
cif.help = ['tourl'];
cif.tags = ['uploader'];
cif.limit = true;
export default cif;
function formatBytes(bytes) {
    if (bytes === 0) {
        return "0 B";
    }
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}
async function uploadToCatbox(content) {
    const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
    const blob = new Blob([content.toArrayBuffer()], { type: mime });
    const formData = new FormData();
    const randomBytes = crypto.randomBytes(5).toString("hex");
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, `${randomBytes}.${ext}`);
    const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
        },
    });
    return await response.text();
}