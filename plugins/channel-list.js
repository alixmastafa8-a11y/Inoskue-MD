import moment from "moment-timezone";
let handler = async (m, { conn, command }) => {
    switch (command) {
        case "channel-list": {
            let id = Object.keys(db.data.chats).filter(a => a.endsWith("@newsletter"));
            let ar = [];
            for (let i of id) {
                let meta = await conn.newsletterMetadata("jid", i);
                ar.push({
                    subject: meta.name,
                    id: meta.id,
                    role: meta.viewer_metadata.role,
                    followers: meta.subscribers.toLocaleString(),
                    create: moment(meta.creation_time * 1000).format("DD/MM/YYYY HH:mm:ss"),
                    picture: meta.picture ? "https://pps.whatsapp.net" + meta.picture : "N/A",
                    url: "https://whatsapp.com/channel/" + meta.invite
                });
            }
            let cap = `*– 乂 N E W S L E T T E R -  L I S T*\n\n${ar
                .map(a => Object.entries(a).map(([key, value]) => `   ◦ ${key} : ${value}`).join("\n"))
                .join("\n\n")}\n\n> Total Newsletter Chat : ${ar.length}`;
            m.reply(cap);
        }
        break;
    }
};
handler.help = handler.command = ["channel-list"];
handler.tags = ["tools"];
export default handler;