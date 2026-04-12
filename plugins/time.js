let handler = async (m) => {
  const now = new Date().toLocaleString('ar-MA', {
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    weekday: 'long'
  });
  const time = new Date().toLocaleTimeString('ar-MA', {
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit'
  });
  const greeting = getGreeting();
  m.reply(`🕰️ *${greeting}* 🕰️\n\nالوقت الحالي في الرباط: *${time}*\nالتاريخ: *${now}*`);
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'صباح الخير';
  if (hour >= 12 && hour < 17) return 'مغرب الخير';
  if (hour >= 17 && hour < 21) return 'عشية الخير';
  return 'ليلتكم سعيدة';
}

handler.help = ['time'];
handler.tags = ['tools'];
handler.command = ['time'];

export default handler;