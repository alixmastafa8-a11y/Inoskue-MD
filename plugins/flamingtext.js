let handler = async (m, { conn, text, args, command, prefix }) => {
    const models = {
        'fluffy-logo': 'fluffy-logo',
        'lava-logo': 'lava-logo',
        'cool-logo': 'cool-logo',
        'comic-logo': 'comic-logo',
        'fire-logo': 'fire-logo',
        'water-logo': 'water-logo',
        'ice-logo': 'ice-logo',
        'elegant-logo': 'elegant-logo',
        'gold-logo': 'gold-logo',
        'blue-logo': 'blue-logo',
        'silver-logo': 'silver-logo',
        'neon-logo': 'neon-logo',
        'skate-name': 'skate-name',
        'retro-logo': 'retro-logo',
        'candy-logo': 'candy-logo',
        'glossy-logo': 'glossy-logo',
    };
    const modelList = Object.keys(models).map(model => `> ${model}`).join('\n');
    if (!text) {
        return m.reply(`طريقة الاستخدام: ${prefix + command} <Model> | <Text>\n\nAvailable Models:\n${modelList}`);
    }
    let response = args.join(' ').split('|');
    if (!response[0] || !response[1]) {
        return m.reply(`• مثال:\n${prefix + command} water-logo | TanakaDomp`);
    }
    const model = response[0].trim();
    const textInput = response[1].trim();
    if (!models[model]) {
        return m.reply(`Invalid model. Choose from:\n${modelList}`);
    }
    m.reply('جارٍ المعالجة...');
    const res = `https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=${models[model]}&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text=${encodeURIComponent(textInput)}`;
    await conn.sendFile(m.chat, res, 'flamingtext.jpg', 'Here is your Flaming Text!', m, false);
};
handler.help = handler.command = ['flamingtext'];
handler.tags = ['tools'];
export default handler;