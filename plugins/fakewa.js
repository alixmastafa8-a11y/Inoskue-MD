import { loadImage, createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('|')) {
    return m.reply(
      `🚩 Incorrect format.\n` +
      `مثال: ${usedPrefix}${command} Noureddine ouafy| +212717457920 | Busy\n` +
      `Reply to the target's profile picture for a custom avatar.`
    );
  }
  let [name, number, status] = text.split('|').map(v => v.trim());
  if (!name || !number) return m.reply('❌ Name and number are required.');
  status = status || 'Busy';
  await m.reply('⏳ Creating Fake WhatsApp Profile...');
  try {
    let profilePicUrl;
    if (m.quoted && m.quoted.mtype === 'imageMessage') {
      const media = await conn.downloadAndSaveMediaMessage(m.quoted);
      profilePicUrl = media;
    } else {
      try {
        profilePicUrl = await conn.profilePictureUrl(m.sender, 'image');
      } catch {
        profilePicUrl = 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'; 
      }
    }
    const [avatar, background] = await Promise.all([
      loadImage(profilePicUrl),
      loadImage('https://files.catbox.moe/1zmbfd.jpg') 
    ]);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(background, 0, 0);
    const avatarSize = 350;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 163;
    ctx.save(); 
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip(); 
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore(); 
    ctx.fillStyle = '#25D366'; 
    ctx.font = '25px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Edit', avatarX + avatarSize / 2, avatarY + avatarSize + 104);
    const startX = 165;
    const startY = 710;
    const gapY = 150;
    const coverRectHeight = 80;
    const coverRectWidth = 850;
    const labelYOffset = 25;
    const valueYOffset = 70;
    const fields = [
        { label: 'Name', value: name },
        { label: 'About', value: status },
        { label: 'Phone', value: formatPhoneNumber(number) },
        { label: 'Link', value: 'Instagram' } 
    ];
    fields.forEach((field, index) => {
        const currentY = startY + (index * gapY);
        ctx.fillStyle = '#111b21'; 
        ctx.fillRect(startX - 60, currentY, coverRectWidth, coverRectHeight);
        ctx.textAlign = 'left';
        ctx.font = '30px Arial';
        ctx.fillStyle = '#a7a4a4'; 
        ctx.fillText(field.label, startX, currentY + labelYOffset);
        ctx.fillStyle = '#ffffff'; 
        ctx.fillText(field.value, startX, currentY + valueYOffset);
    });
    function formatPhoneNumber(n) {
      if (n.startsWith('08')) n = '62' + n.slice(1); 
      if (n.startsWith('62') && n.length >= 10) {
        return `+62 ${n.slice(2, 5)}-${n.slice(5, 9)}-${n.slice(9)}`;
      } else if (n.startsWith('+')) {
        return n;
      } else if (/^\d+$/.test(n)) {
        return `+${n}`;
      } else {
        return n;
      }
    }
    const buffer = canvas.toBuffer('image/png');
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: 'Fake WhatsApp Profile by Noroshi'
    }, { quoted: m });
  } catch (err) {
    console.error('[FAKEWA ERROR]', err);
    m.reply('❌ فشل to create Fake WhatsApp Profile: ' + err.message);
  }
};
handler.help = ['fakewa'];
handler.tags = ['tools'];
handler.command = /^fakewa$/i;
handler.limit = true;
export default handler;