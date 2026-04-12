let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`يرجى إدخال أمر صحيح\n\nالاستخدام: ${usedPrefix + command} <رقم>`);
  const num = parseInt(text);
  if (isNaN(num)) return m.reply('يرجى إدخال رقم صحيح');

  const choices = ['حجر', 'ورق', 'مقص'];
  const compChoice = choices[Math.floor(Math.random() * choices.length)];
  const userChoice = choices[num - 1];

  if (!userChoice) return m.reply('يرجى إدخال رقم بين 1 و 3');

  let result;
  if (userChoice === compChoice) {
    result = 'تعادل';
  } else if ((userChoice === 'حجر' && compChoice === 'مقص') ||
             (userChoice === 'ورق' && compChoice === 'حجر') ||
             (userChoice === 'مقص' && compChoice === 'ورق')) {
    result = 'فزت';
  } else {
    result = 'خسرت';
  }

  m.reply(`اخترت: ${userChoice}\nالكمبيوتر اختار: ${compChoice}\nالنتيجة: ${result}`);
};

handler.help = ['x'];
handler.tags = ['fun'];
handler.command = ['x'];

export default handler;