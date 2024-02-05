import { Bot, webhookCallback } from "grammy";
import { Env, TContext, tSession } from "./session";
import { handleUpdate } from "./bot";

export default {
  async fetch(
    req: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(req.url);
      const bot = new Bot<TContext>(env.TOKEN);
      if (url.pathname === "/" && req.method === "GET") {
        const webhook_info = await bot.api.getWebhookInfo();
        if (!webhook_info.url) {
          await bot.api.setWebhook(url.origin + url.pathname);
        }
        console.log(webhook_info);
        return new Response("!");
      }
      bot.use(tSession(env.REKORD));
      handleUpdate(bot, env);
      return webhookCallback(bot, "cloudflare-mod")(req);
    } catch (e: any) {
      return new Response(e.message);
    }
  },
};
