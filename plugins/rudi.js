let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('يرجى إرسال your question after the command.');
  const logic = "Your name is Rudi and you are a specialist doctor in urology.";
  const question = text;
  const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat";
  const query = [
    { role: "system", content: logic },
    { role: "user", content: question }
  ];
  const params = new URLSearchParams({
    query: JSON.stringify(query),
    link: "writecream.com"
  });
  try {
    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();
    if (data?.response_content) {
      await m.reply(data.response_content);
    } else {
      await m.reply("I couldn't get a proper response:\n" + JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(error);
    await m.reply("حدث خطأ while fetching the response: " + error.message);
  }
};
handler.help = handler.command = ['rudi'];
handler.tags = ['ai'];
export default handler;