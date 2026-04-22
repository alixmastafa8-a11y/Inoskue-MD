import { createCanvas, loadImage } from "canvas";
import fetch from 'node-fetch';
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    let lines = [];
    let line = "";
    for (let word of words) {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
            lines.push(line.trim());
            line = word + " ";
        } else {
            line = testLine;
        }
    }
    if (line.length > 0) lines.push(line.trim());
    return lines;
}
async function generateCommentBuffer({
    username = "User",
    comment = "This is a sample comment.",
    profilePicBuffer = null
}) {
    const scale = 4; 
    const maxWidth = 210;
    const lineHeight = 25;
    const fontMain = "bold 18px 'Segoe UI', Arial, sans-serif";
    const fontReply = "14px 'Segoe UI', Arial, sans-serif";
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.font = fontMain;
    const lines = wrapText(tempCtx, comment, maxWidth);
    const textHeight = lines.length * lineHeight;
    const bubbleHeight = textHeight + 45; 
    const bubbleWidth = maxWidth + 40;
    const canvas = createCanvas((bubbleWidth + 20) * scale, (bubbleHeight + 20) * scale);
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
    roundRect(ctx, 10, 10, bubbleWidth, bubbleHeight, 20); 
    ctx.fill();
    ctx.shadowColor = "transparent"; 
    if (profilePicBuffer) {
        try {
            const img = await loadImage(profilePicBuffer);
            ctx.save();
            ctx.beginPath();
            ctx.arc(40, 42, 15, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, 25, 27, 30, 30);
            ctx.restore();
        } catch (err) {
            console.warn("⚠️ فشل to load profile picture:", err.message);
        }
    }
    ctx.fillStyle = "black";
    ctx.font = fontMain;
    let y = 48; 
    for (const line of lines) {
        ctx.fillText(line, 70, y);
        y += 22; 
    }
    ctx.fillStyle = "#657786"; 
    ctx.font = fontReply;
    ctx.fillText(`Replying to @${username}`, 70, bubbleHeight - 8);
    return canvas.toBuffer("image/png");
}
let handler = async (m, { conn, text }) => {
    if (!text) throw 'يرجى تقديم the text you want to appear in the comment.\n\n*مثال:* .comment Hello world!';
    await m.reply('🎨 Generating your comment image...');
    let ppBuffer;
    try {
        const ppUrl = await conn.profilePictureUrl(m.sender, 'image');
        ppBuffer = await (await fetch(ppUrl)).buffer();
    } catch (e) {
        console.error("Could not fetch profile picture, using default.", e);
        ppBuffer = null; 
    }
    try {
        const resultBuffer = await generateCommentBuffer({
            username: m.pushName || "User",
            comment: text,
            profilePicBuffer: ppBuffer
        });
        await conn.sendFile(m.chat, resultBuffer, 'comment.png', 'Here is your generated comment:', m);
    } catch (error) {
        console.error("Error generating comment image:", error);
        m.reply("❌ حدث خطأ while creating the image. Please try again later.");
    }
};
handler.help = ['replycomment'];
handler.command = ['replycomment','comment'];
handler.tags = ['tools'];
handler.limit = true;
export default handler;