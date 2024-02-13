import { Bot, InlineKeyboard, InputFile, Keyboard } from "grammy";
import { TContext, Env, Steps, SessionData } from "./session";
import { KvAdapter } from "./kv";

const force_channels = [
  "https://t.me/angormatbuot",
  "https://t.me/REKORD_IT",
  // add new channels here
];

const getForceMessage = (retry = false) => ({
  message: !retry
    ? "Assalomu aleykum. Ro'yxatdan o'tishdan oldin quyidagi kanallarga obuna bo'ling!"
    : "Ro'yxatdan o'tish uchun quyidagi kanallarga obuna bo'lishingiz shart!",
  keyboard: (() => {
    const keyboard = new InlineKeyboard();
    for (let i = 0; i < force_channels.length; i++) {
      keyboard.url(`${i + 1}-kanal`, force_channels[i]);
    }

    keyboard.text("✅ Tasdiqlash", "check").toFlowed(1);
    return keyboard;
  })(),
});

const askLastName = async (ctx: TContext, retry = false) => {
  await ctx.reply(
    !retry
      ? "Familiyangizni kiriting:"
      : "Iltimos, familiyangizni to'g'ri kiriting:",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Abdullayev",
      },
    }
  );
};

const getLastName = (ctx: TContext): string => {
  if (ctx.message?.text && /^[a-z ']+$/i.test(ctx.message.text)) {
    return ctx.message.text;
  }
  return "";
};

const askFirstName = async (ctx: TContext, retry = false) => {
  await ctx.reply(
    !retry ? "Ismingizni kiriting:" : "Iltimos, ismingizni to'g'ri kiriting:",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Abdulla",
      },
    }
  );
};

const getFirstName = (ctx: TContext): string => {
  if (ctx.message?.text && /^[a-z ']+$/i.test(ctx.message.text)) {
    return ctx.message.text;
  }
  return "";
};

const askMiddleName = async (ctx: TContext, retry = false) => {
  await ctx.reply(
    !retry
      ? "Otangizni ismini kiriting:"
      : "Iltimos, otangizni ismini to'g'ri kiriting:",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Abdulla o'g'li",
      },
    }
  );
};

const getMiddleName = (ctx: TContext): string => {
  if (ctx.message?.text && /^[a-z ']+$/i.test(ctx.message.text)) {
    return ctx.message.text;
  }
  return "";
};

const getPhone = (ctx: TContext): string => {
  if (ctx.message?.contact) {
    return ctx.message.contact.phone_number;
  } else if (
    ctx.message?.text &&
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g.test(
      ctx.message.text
    )
  ) {
    return ctx.message?.text;
  }
  return "";
};

const askPhone = async (ctx: TContext, retry = false) => {
  await ctx.reply(
    !retry
      ? "Telefon raqamingizni kiriting yoki quyidagi tugma orqali kontaktingizni ulashing:"
      : "Iltimos, telefon raqamingizni to'g'ri kiriting yoki quyidagi tugma orqali kontaktingizni ulashing:",
    {
      reply_markup: new Keyboard()
        .requestContact("Kontaktimni ulashish")
        .placeholder("998912345678"),
    }
  );
};

const getBirthday = (ctx: TContext): string => {
  if (
    ctx.message?.text &&
    /(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d{2}/g.test(
      ctx.message.text
    )
  ) {
    return ctx.message.text;
  }
  return "";
};

const askBirthday = async (ctx: TContext, retry = false) => {
  await ctx.reply(
    !retry
      ? "Tug'ilgan sanangizni kiriting:"
      : "Iltimos tug'ulgan sangizni to'g'ri kiriting:",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "31.12.1999",
      },
    }
  );
};

const askNeighborhood = async (ctx: TContext, retry = false) => {
  await ctx.reply(
    !retry
      ? "Mahallangizni nomini kiriting:"
      : "Iltimos, mahallangiz nomini to'g'ri kiriting:",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Ulug'bek MFY",
      },
    }
  );
};

const askSchool = async (ctx: TContext, retry = false) => {
  await ctx.reply(
    !retry
      ? "O'quv yoki ish joyingizni kiriting:"
      : "Iltimos, o'quv yoki ish joyingizni to'g'ri kiriting:",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Record MCHJ. yoki 29-maktab.",
      },
    }
  );
};

const getNeighborhood = (ctx: TContext): string => {
  if (ctx.message?.text && ctx.message?.text.length > 0) {
    return ctx.message.text;
  }
  return "";
};

const getSchool = (ctx: TContext): string => {
  if (ctx.message?.text) {
    return ctx.message.text;
  }
  return "";
};

export const handleUpdate = (bot: Bot<TContext>, env: Env) => {
  const pm = bot.chatType("private");
  pm.command("start", async (ctx) => {
    try {
      if ([env.OWNER_ID, 868943255].includes(ctx.from.id)) {
        let csv = `Familiyasi, Ismi, Otasining ismi, Tug'ilgan sanasi, Telefon raqami, Mahallasi, Maktabi\n`;
        for await (const value of new KvAdapter<SessionData>(
          env.REKORD
        ).readAllValues()) {
          if (value.school) {
            csv += `${value.last_name}, ${value.first_name}, ${value.middle_name}, ${value.birthday}, ${value.phone_number}, ${value.neighborhood}, ${value.school}\n`;
          }
        }
        await ctx.replyWithDocument(
          new InputFile(new TextEncoder().encode(csv), "applications.csv")
        );
        return;
      }
      const force_message = getForceMessage();
      await ctx.reply(force_message.message, {
        reply_markup: force_message.keyboard,
      });
    } catch (e) {
      console.error("start", e);
      await ctx.reply("Nomalum xatolik.");
    }
  });

  // pm.callbackQuery("check", async (ctx) => {
  //   try {
  //     const session = await ctx.session;
  //     const user_id = ctx.from.id;
  //     let isSubscribed = true;
  //     force_channels.forEach(async (url) => {
  //       try {
  //         const username = "@" + new URL(url).pathname;
  //         const msg = await bot.api.sendMessage(username, "!");
  //         const {
  //           chat: { id: chat_id },
  //         } = msg;
  //         await bot.api.deleteMessage(chat_id, msg.message_id);
  //         const member = await bot.api.getChatMember(chat_id, user_id);
  //         isSubscribed = ["creator", "administrator", "member"].includes(
  //           member.status
  //         );
  //       } catch (e) {
  //         console.error("check", e);
  //         await ctx.reply("Nomalum xatolik.");
  //       }
  //     });
  //     session.subscribed = isSubscribed;
  //     if (isSubscribed) {
  //       await ctx.reply("Kanallarga obunangiz tasdiqlandi ✔");
  //       await askLastName(ctx);
  //     } else {
  //       await ctx.reply("Siz hali kanallardan biriga obuna bo'lmadingiz!");
  //       await ctx.reply(getForceMessage().message, {
  //         reply_markup: getForceMessage().keyboard,
  //       });
  //       await ctx.reply(getForceMessage(true).message);
  //     }
  //   } catch (e) {
  //     console.error("check", e);
  //     await ctx.reply("Nomalum xatolik.");
  //   }
  // });

  pm.callbackQuery("check", async (ctx) => {
    try {
      const session = await ctx.session;
      const user_id = ctx.from.id;

      let isSubscribed = false;

      for (const url of force_channels) {
        try {
          const channel_username = url.substring(url.lastIndexOf("/") + 1);
          const username = "@" + channel_username;
          const msg = await bot.api.sendMessage(username, "!");
          const {
            chat: { id: chat_id },
          } = msg;
          await bot.api.deleteMessage(chat_id, msg.message_id);
          const member = await bot.api.getChatMember(chat_id, user_id);

          if (["creator", "administrator", "member"].includes(member.status)) {
            isSubscribed = true;
            break;
          }
        } catch (e) {
          console.error("check", e);
        }
      }

      session.subscribed = isSubscribed;

      if (isSubscribed) {
        await ctx.reply("Kanallarga obunangiz tasdiqlandi ✔");
        await askLastName(ctx);
      } else {
        await ctx.reply(getForceMessage(true).message);
        await ctx.reply(getForceMessage().message, {
          reply_markup: getForceMessage().keyboard,
        });
      }
    } catch (e) {
      console.error("check", e);
      await ctx.reply("Nomalum xatolik.");
    }
  });

  pm.on([":text", ":contact"], async (ctx: TContext) => {
    try {
      const session = await ctx.session;
      if (!session.subscribed) {
        const force_message = getForceMessage(true);
        await ctx.reply(force_message.message, {
          reply_markup: force_message.keyboard,
        });
        return;
      }
      const step = Object.values(Steps).find((s) => session[s] === "");
      switch (step) {
        case Steps.LAST_NAME:
          if ((session.last_name = getLastName(ctx))) {
            await askFirstName(ctx);
          } else {
            await askLastName(ctx, true);
          }
          break;
        case Steps.FIRST_NAME:
          if ((session.first_name = getFirstName(ctx))) {
            await askMiddleName(ctx);
          } else {
            await askFirstName(ctx, true);
          }
          break;
        case Steps.MIDDLE_NAME:
          if ((session.middle_name = getMiddleName(ctx))) {
            await askPhone(ctx);
          } else {
            await askMiddleName(ctx, true);
          }
          break;
        case Steps.PHONE_NUMBER:
          if ((session.phone_number = getPhone(ctx))) {
            await askBirthday(ctx);
          } else {
            await askPhone(ctx, true);
          }
          break;
        case Steps.BIRTHDAY:
          if ((session.birthday = getBirthday(ctx))) {
            await askNeighborhood(ctx);
          } else {
            await askBirthday(ctx, true);
          }
          break;
        case Steps.NEIGHBORHOOD:
          if ((session.neighborhood = getNeighborhood(ctx))) {
            await askSchool(ctx);
          } else {
            await askNeighborhood(ctx, true);
          }
          break;
        case Steps.SCHOOL:
          if ((session.school = getSchool(ctx))) {
            await ctx.reply(
              "Malumotlaringiz saqlandi. @REKORD_IT kanalida natijalar e'lon qilinadi."
            );
          } else {
            await askSchool(ctx, true);
          }
          break;
      }
    } catch (e) {
      console.error("reg", e);
      await ctx.reply("Nomalum xatolik.");
    }
  });
};
