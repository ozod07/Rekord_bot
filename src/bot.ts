import { Bot } from "grammy";
import { TContext, Env } from "./session";

const handleUpdate = (bot: Bot<TContext>, env: Env) => {
  const pm = bot.chatType("private");
  pm.command("start", async (ctx) => {
    await ctx.reply("Assalomu aleykum.");
  });
};
