const freeFireCharacters = [
  {
    name: "DJ Alok",
    ability: "Drop the Beat",
    description: "يخلق هالة بقطر 5 أمتار تزيد سرعة الحركة بنسبة 15% وتعيد 5 نقاط صحة/ثانية لمدة 10 ثوانٍ.",
    type: "نشط"
  },
  {
    name: "Kelly",
    ability: "Dash",
    description: "تزيد سرعة الجري بنسبة 6% عند المستوى الأقصى.",
    type: "سلبي"
  },
  {
    name: "Chrono",
    ability: "Time Turner",
    description: "يخلق حقل قوة يصد 800 ضرر، مع زيادة سرعة بنسبة 15% للحلفاء داخله لمدة 4 ثوانٍ.",
    type: "نشط"
  },
  {
    name: "A124",
    ability: "Thrill of Battle",
    description: "تحول 60 نقطة طاقة إلى صحة في 4 ثوانٍ، مع فترة تهدئة 10 ثوانٍ.",
    type: "نشط"
  },
  {
    name: "Kapella",
    ability: "Healing Song",
    description: "تزيد فعالية عناصر الشفاء بنسبة 20% وتقلل فقدان صحة الحلفاء عند السقوط بنسبة 30%.",
    type: "سلبي"
  },
  {
    name: "Maxim",
    ability: "Gluttony",
    description: "تقلل وقت أكل الفطر واستخدام عدة الإسعاف بنسبة 40%.",
    type: "سلبي"
  },
  {
    name: "Moco",
    ability: "Hacker's Eye",
    description: "تعلم الأعداء المصابين لمدة 5 ثوانٍ، وتشارك موقعهم مع الفريق.",
    type: "سلبي"
  },
  {
    name: "Wukong",
    ability: "Camouflage",
    description: "يتحول إلى شجيرة لمدة 15 ثانية، مع فترة تهدئة 200 ثانية تُعاد تعيينها عند القتل.",
    type: "نشط"
  },
  {
    name: "Laura",
    ability: "Sharp Shooter",
    description: "تزيد الدقة بنسبة 35% عند استخدام المِزاحم.",
    type: "سلبي"
  },
  {
    name: "K",
    ability: "Master of All",
    description: "يزيد الحد الأقصى للطاقة بـ 50، مع وضع الجوجيتسو (تحويل الطاقة إلى صحة بزيادة 500%) ووضع علم النفس (استعادة 2 طاقة كل 3 ثوانٍ).",
    type: "نشط"
  },
  {
    name: "Hayato",
    ability: "Bushido",
    description: "يزيد اختراق الدروع بنسبة 7.5% لكل 10% نقص في الصحة القصوى.",
    type: "سلبي"
  },
  {
    name: "Alvaro",
    ability: "Art of Demolition",
    description: "يزيد ضرر المتفجرات بنسبة 16% ومداها بنسبة 10%.",
    type: "سلبي"
  },
  {
    name: "Jota",
    ability: "Sustained Raids",
    description: "يستعيد 40 نقطة صحة عند قتل عدو بمسدس أو بندقية صيد.",
    type: "سلبي"
  },
  {
    name: "Skyler",
    ability: "Riptide Rhythm",
    description: "يطلق موجة صوتية تدمر 5 جدران جيلي في نطاق 100 متر، ويستعيد 9 نقاط صحة لكل جدار جيلي نشط.",
    type: "نشط"
  },
  {
    name: "Dimitri",
    ability: "Healing Heartbeat",
    description: "يخلق منطقة شفاء بقطر 3.5 متر تعيد 3 نقاط صحة/ثانية لمدة 15 ثانية.",
    type: "نشط"
  },
  {
    name: "Shani",
    ability: "Gear Recycle",
    description: "تعيد 20% من متانة الدرع بعد كل قتل، وترقي الدرع عند التبديل.",
    type: "سلبي"
  },
  {
    name: "Olivia",
    ability: "Healing Touch",
    description: "تعيد 6 نقاط صحة إضافية للحلفاء عند إنعاشهم.",
    type: "سلبي"
  },
  {
    name: "Andrew",
    ability: "Armor Specialist",
    description: "تقلل ضرر الدروع بنسبة 12%.",
    type: "سلبي"
  },
  {
    name: "Rafael",
    ability: "Dead Silent",
    description: "يخفي إطلاق النار على الخريطة الصغيرة لمدة 8 ثوانٍ ويزيد فقدان صحة الأعداء المسقطين بنسبة 45%.",
    type: "سلبي"
  },
  {
    name: "Clu",
    ability: "Tracing Steps",
    description: "تكشف مواقع الأعداء غير المتموضعين في نطاق 50 مترًا لمدة 7 ثوانٍ، وتشاركها مع الفريق.",
    type: "نشط"
  },
  {
    name: "Steffie",
    ability: "Painted Refuge",
    description: "تخلق منطقة تمنع القنابل وتقلل ضرر الذخيرة بنسبة 15% وتستعيد 10% من متانة الدرع لمدة 10 ثوانٍ.",
    type: "نشط"
  },
  {
    name: "Xayne",
    ability: "Xtreme Encounter",
    description: "تزيد الصحة المؤقتة بـ 80 نقطة وتزيد ضرر الجدران والدروع بنسبة 40% لمدة 15 ثانية.",
    type: "نشط"
  },
  {
    name: "D-Bee",
    ability: "Bullet Beats",
    description: "تزيد سرعة الحركة بنسبة 15% والدقة بنسبة 35% أثناء إطلاق النار أثناء الحركة.",
    type: "سلبي"
  },
  {
    name: "Luqueta",
    ability: "Hat Trick",
    description: "يزيد الحد الأقصى للصحة بـ 25 نقطة (حتى 100) مع كل قتل.",
    type: "سلبي"
  },
  {
    name: "Sonia",
    ability: "Nano Lifeshield",
    description: "يخلق درعًا مؤقتًا يمتص 200 ضرر لمدة 5 ثوانٍ عند تلقي ضرر قاتل، مع فترة تهدئة 120 ثانية.",
    type: "نشط"
  },
  {
    name: "Nikita",
    ability: "Firearms Expert",
    description: "تسرع إعادة تعبئة الأسلحة الرشاشة بنسبة 24%.",
    type: "سلبي"
  },
  {
    name: "Ford",
    ability: "Iron Will",
    description: "تقلل الضرر خارج المنطقة الآمنة بنسبة 24%.",
    type: "سلبي"
  },
  {
    name: "Caroline",
    ability: "Agility",
    description: "تزيد سرعة الحركة بنسبة 8% عند حمل بنادق الصيد.",
    type: "سلبي"
  },
  {
    name: "Paloma",
    ability: "Arms-dealing",
    description: "تتيح حمل 60 طلقة ذخيرة بندقية إضافية دون استهلاك مساحة الحقيبة.",
    type: "سلبي"
  },
  {
    name: "Kla",
    ability: "Muay Thai",
    description: "تزيد ضرر اللكمات بنسبة 100%.",
    type: "سلبي"
  },
  {
    name: "Miguel",
    ability: "Crazy Slayer",
    description: "يكسب 80 نقطة طاقة مع كل قتل.",
    type: "سلبي"
  },
  {
    name: "Antonio",
    ability: "Gangster's Spirit",
    description: "يبدأ الجولة بـ 35 نقطة صحة إضافية.",
    type: "سلبي"
  },
  {
    name: "Misha",
    ability: "Afterburner",
    description: "تزيد سرعة القيادة بنسبة 10% وتقلل ضرر المركبات بنسبة 30%.",
    type: "سلبي"
  },
  {
    name: "Notora",
    ability: "Racer's Blessing",
    description: "تعيد 5 نقاط صحة/ثانية لجميع أعضاء الفريق في المركبة لمدة 10 ثوانٍ.",
    type: "سلبي"
  },
  {
    name: "Joseph",
    ability: "Nutty Movement",
    description: "تزيد سرعة الحركة بنسبة 20% لمدة 1 ثانية عند تلقي ضرر.",
    type: "سلبي"
  },
  {
    name: "Maro",
    ability: "Falcon Fervor",
    description: "يزيد الضرر مع المسافة بنسبة 25% ويزيد ضرر الأعداء المعلمين بنسبة 3.5%.",
    type: "سلبي"
  },
  {
    name: "Wolfrahh",
    ability: "Limelight",
    description: "تقلل ضرر طلقات الرأس بنسبة 25% وتزيد ضرر الأطراف بنسبة 15%.",
    type: "سلبي"
  },
  {
    name: "Tatsuya",
    ability: "Rebel Rush",
    description: "يتيح الاندفاع مرتين متتاليتين بسرعة عالية مع فترة تهدئة 1 ثانية.",
    type: "نشط"
  },
  {
    name: "Kenta",
    ability: "Swordsman's Wrath",
    description: "يخلق درعًا أماميًا يقلل الضرر بنسبة 60% لمدة 5 ثوانٍ، ينخفض إلى 20% عند إطلاق النار.",
    type: "نشط"
  },
  {
    name: "Nairi",
    ability: "Ice Iron",
    description: "تزيد متانة جدران الجيلي بنسبة 30% وتعيد 20 نقطة صحة/ثانية عند إطلاق النار عليها.",
    type: "سلبي"
  },
  {
    name: "Leon",
    ability: "Buzzer Beater",
    description: "يستعيد 30 نقطة صحة بعد النجاة من القتال.",
    type: "سلبي"
  },
  {
    name: "Otho",
    ability: "Memory Mist",
    description: "يكشف مواقع الأعداء في نطاق 50 مترًا لمدة 10 ثوانٍ بعد قتل عدو.",
    type: "نشط"
  },
  {
    name: "Thiva",
    ability: "Vital Vibes",
    description: "تزيد سرعة الإنعاش بنسبة 20% وتعيد 40 نقطة صحة عند الإنعاش.",
    type: "سلبي"
  },
  {
    name: "Orion",
    ability: "Crimson Crush",
    description: "يستبدل الطاقة بـ 300 طاقة قرمزية، يصبح محصنًا ويمتص 10 نقاط صحة من الأعداء في نطاق 5 أمتار.",
    type: "نشط"
  }
];
async function handler(m, { conn }) {
  try {
    const characterList = freeFireCharacters
      .map((char, index) => `${index + 1}. ${char.name}`)
      .join("\n");
    const message = `
*قائمة شخصيات فري فاير*
يرجى الرد على هذه الرسالة برقم الشخصية التي تريد معرفة تفاصيلها:\n
${characterList}
    `.trim();
    const sentMsg = await conn.sendMessage(m.chat, { text: message }, { quoted: m });
    console.log("Character list sent with ID:", sentMsg.key.id);
    const timeoutDuration = 60000;
    let listenerActive = true;
    const listener = async ({ messages }) => {
      if (!listenerActive) return;
      const reply = messages[0];
      const quotedStanzaId = reply.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const isReplyToList =
        reply.key.remoteJid === m.chat &&
        reply.message &&
        quotedStanzaId === sentMsg.key.id;
      if (!isReplyToList) return;
      const repliedText = reply.message?.extendedTextMessage?.text || reply.message?.conversation;
      if (!repliedText || !repliedText.match(/^\d+$/)) {
        await conn.sendMessage(
          m.chat,
          { text: "يرجى الرد برقم صحيح من القائمة!" },
          { quoted: reply }
        );
        return;
      }
      const number = parseInt(repliedText) - 1;
      if (number >= 0 && number < freeFireCharacters.length) {
        const char = freeFireCharacters[number];
        const charInfo = `
*معلومات الشخصية: ${char.name}*
- *القدرة*: ${char.ability} (${char.type})
- *الوصف*: ${char.description}
        `.trim();
        await conn.sendMessage(m.chat, { text: charInfo }, { quoted: reply });
      } else {
        await conn.sendMessage(
          m.chat,
          { text: "رقم غير صحيح! يرجى اختيار رقم من القائمة." },
          { quoted: reply }
        );
      }
      listenerActive = false;
      conn.ev.off("messages.upsert", listener);
    };
    conn.ev.on("messages.upsert", listener);
    setTimeout(() => {
      if (listenerActive) {
        listenerActive = false;
        conn.ev.off("messages.upsert", listener);
        conn.sendMessage(
          m.chat,
          { text: "لم يتم تلقي رد خلال 60 ثانية. يرجى استخدام .ff مرة أخرى لإعادة المحاولة." },
          { quoted: sentMsg }
        );
      }
    }, timeoutDuration);
  } catch (e) {
    await m.reply(`خطأ: ${e.message}`);
    console.error("Handler error:", e);
  }
}
handler.help = ["ff"];
handler.tags = [ "tools"];
handler.command = /^(ff)$/i;
handler.limit = true 
export default handler;