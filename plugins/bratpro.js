const handler = async (m, { conn, text }) => {
  if (!text) return m.reply("مثال: .bratpro silana ai");
  try {
    const caption = `Please choose the desired type:\n\n1. *Image 🖼️*\n2. *Video 🎥*`;
    await conn.sendMessage(
      m.chat,
      {
        text: caption,
        footer: "silana ai ~ By Moureddine ouafy",
        buttons: [
          {
            buttonId: `.brat ${text}`,
            buttonText: { displayText: "Image 🖼️" },
          },
          {
            buttonId: `.bratvideo ${text}`,
            buttonText: { displayText: "Video 🎥" },
          },
        ],
        viewOnce: true,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error(err);
    m.reply(`*حدث خطأ!* 😭\n${err.message || err}`);
  }
};
handler.help = ["bratpro"];
handler.tags = ["ملصق"];
handler.command = ["bratpro"];
handler.limit = true;
export default handler;