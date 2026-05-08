import { WAMessageStubType } from '@adiwajshing/baileys';
export async function before(m) {
	if (!m.messageStubType || !m.isGroup) return;
	const edtr = `🧙‍♂️ @${m.sender.split('@')[0]} 🧙‍♂️`;
	const messages = {
		21: `changed the group subject to:\n📜 *${m.messageStubParameters[0]}*`,
		33: `changed their number 📱`,
		22: `changed the group icon 🖼️`,
		1: `*reset* the group link! 🔗`,
		23: `*reset* the group link! 🔗`,
		132: `*reset* the group link! 🔗`,
		24: `changed the group description.\n\n${m.messageStubParameters[0]}`,
		25: `set it so that *${m.messageStubParameters[0] == 'on' ? 'only admins' : 'all participants'}* can edit group info. 🔧`,
		26: `*${m.messageStubParameters[0] == 'on' ? 'closed' : 'opened'}* the group!\nNow ${m.messageStubParameters[0] == 'on' ? 'only admins' : 'all participants'} can send messages. 🔒`,
		29: `made @${m.messageStubParameters[0].split('@')[0]} an admin. 👨‍💼`,
		30: `removed @${m.messageStubParameters[0].split('@')[0]} from admin. 👨‍💼🚪`,
		72: `changed disappearing messages duration to *@${m.messageStubParameters[0]}* ⏳`,
		123: `*disabled* disappearing messages. 🕓`,
		45: `started a video/audio call in the group 🎥📞`,
		46: `started a video/audio call in the group 🎥📞`,
		71: `wants to join this group 🚪`,
		74: `sent view-once media 📸`,
		141: `joined via link 🌐`,
		142: `created a community group 🛋️`,
		143: `deleted a community group 🗑️`,
		156: `conducted a poll in the group 📊`,
	};
	const messageType = messages[m.messageStubType];
	const fakes = {
		key: { 
			fromMe: false, 
			participant: '0@s.whatsapp.net', 
			remoteJid: 'status@broadcast', 
			id: 'fake-id' 
		},
		message: {
			conversation: 'This is a fake message'
		}
	};
	if (messageType) {
		await this.sendMessage(m.chat, { text: `${edtr} ${messageType}`, mentions: m.messageStubParameters[0] !== undefined ? [m.sender, m.messageStubParameters[0]] : [m.sender] }, { quoted: fakes });
	} else {
		console.log({
			messageStubType: m.messageStubType,
			messageStubParameters: m.messageStubParameters,
			type: WAMessageStubType[m.messageStubType],
		});
	}
}
export const disabled = false;