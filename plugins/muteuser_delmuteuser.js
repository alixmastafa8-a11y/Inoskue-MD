let handler = async (m, { conn, command }) => {
    if (!conn.muted) conn.muted = {};
    if (!conn.muted[m.chat]) conn.muted[m.chat] = [];
    try {
        let who;
        if (m.quoted) {
            who = m.message.extendedTextMessage.contextInfo.participant;
        } else {
            throw 'Reply to the user message you want to mute';
        }
        if (command === 'muteuser') {
            if (conn.muted[m.chat].includes(who)) {
                throw 'User is already muted!';
            }
            conn.muted[m.chat].push(who);
            m.reply(`User successfully muted`);
        } else if (command === 'delmuteuser') {
            if (!conn.muted[m.chat].includes(who)) {
                throw 'User is not muted!';
            }
            let index = conn.muted[m.chat].indexOf(who);
            conn.muted[m.chat].splice(index, 1);
            m.reply(`User successfully unmuted`);
        }
    } catch (e) {
        m.reply(e);
    }
};
handler.before = async (m, { conn }) => {
    if (!m.isGroup) return;
    if (!conn.muted?.[m.chat]) return;
    if (conn.muted[m.chat].includes(m.sender)) {
        try {
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.sender
                }
            });
        } catch (error) {
            console.log('Error deleting message:', error);
        }
    }
};
handler.help = ['muteuser', 'delmuteuser'];
handler.tags = ['owner'];
handler.command = /^(muteuser|delmuteuser)$/i;
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
handler.owner = true;
export default handler;