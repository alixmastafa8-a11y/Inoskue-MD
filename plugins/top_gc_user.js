let handler = async (m, {
    text
}) => {
    try {
        const {
            participants: user
        } = await conn.groupMetadata(m.chat);
        function getRandomUsers(arr, num) {
            let shuffled = arr.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
        }
        let top10 = await getRandomUsers(user, 10);
        let cap = `Top 10 ${text ? text : ""}\n\n`;
        for (let usr of top10) {
            cap += `@${usr.id.split("@")[0]}\n`
        }
        await conn.reply(m.chat, cap, m, {
            contextInfo: {
                mentionedJid: top10.map(v => v.id)
            }
        })
    } catch (e) {
        throw eror
    }
}
handler.help = handler.command = ["top_gc_user"]
handler.tags = ["owner"]
handler.group = true
handler.owner = true
export default handler