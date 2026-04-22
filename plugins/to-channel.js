async function handler(m, { conn, text }) {
    try {
        await conn.sendMessage(m.chat, { react: { text: '🕐', key: m.key } });
        const isMedia = m.quoted && (m.quoted.mimetype || m.quoted.isMedia);
        const type = m.quoted?.mimetype || '';
        const contentText = text?.trim();
        const idsal = '120363285847738492@newsletter'; 
        const pushname = m.pushName || 'User';
        const bannedWords = ['bokep', 'panel', 'jual', 'promo', 'discount', 'diskon', 'top up', 'topup', 'cheat', 'casino', 'slot'];
        const containsBannedWord = bannedWords.some(word => contentText?.toLowerCase().includes(word));
        if (containsBannedWord) {
            await conn.reply(m.chat, 'Message blocked due to forbidden words.', m);
            try {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            } catch {
                await conn.reply(m.chat, 'فشل to kick user, check bot permissions.', m);
            }
            return;
        }
        let ppuser;
        try {
            ppuser = await conn.profilePictureUrl(m.sender, 'image');
        } catch {
            ppuser = 'https://files.catbox.moe/hnbuh3.jpg';
        }
        const ctx = {
            mentionedJid: [m.sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: idsal,
                serverMessageId: 20,
                newsletterName: 'silana Ai | أسطورة البوتات '
            },
            externalAdReply: {
                title: pushname,
                body: `Silana runtime is active.| سيلانا رهن الاشارة`,
                thumbnailUrl: ppuser,
                mediaType: 1,
                sourceUrl: 'https://whatsapp.com/channel/0029VaX4b6J7DAWqt3Hhu01A'
            }
        };
        if (isMedia) {
            const media = await m.quoted.download(true); 
            if (/image/.test(type)) {
                await conn.sendMessage(idsal, { image: { url: media }, caption: contentText || '', contextInfo: ctx });
            } else if (/video/.test(type)) {
                await conn.sendMessage(idsal, { video: { url: media }, caption: contentText || '', contextInfo: ctx });
            } else if (/audio/.test(type)) {
                await conn.sendMessage(idsal, { audio: { url: media }, mimetype: 'audio/mp4', ptt: true, contextInfo: ctx });
            } else if (/ملصق/.test(type)) {
                await conn.sendMessage(idsal, { ملصق: { url: media }, contextInfo: ctx });
            } else if (/application/.test(type)) {
                await conn.sendMessage(idsal, { document: { url: media }, mimetype: type, fileName: 'File.pdf', contextInfo: ctx });
            } else {
                await conn.reply(m.chat, "Unsupported format.", m);
            }
        } else if (contentText) {
            await conn.sendMessage(idsal, { text: contentText, contextInfo: ctx });
        } else {
            await conn.reply(m.chat, "Send text or reply to media.", m);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (err) {
        await conn.reply(m.chat, `❌ Error\nError log: ${err}`, m);
    }
}
handler.command = ['to-channel'];
handler.help = ['to-channel'];
handler.tags = ['owner'];
handler.owner = true;
export default handler;