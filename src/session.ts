import { Context, SessionFlavor, lazySession } from "grammy";
import { KvAdapter } from "./kv";

export interface Env {
  TOKEN: string;
  REKORD: KVNamespace;
}

interface SessionData {
  first_name: string;
  last_name: string;
  middle_name: string;
  birthday: string;
  phone_number: string;
  neighborhood: string;
  school: string;
}

export type TContext = Context & SessionFlavor<SessionData>;

export const tSession = (namespace: KVNamespace) =>
  lazySession({
    initial: (): SessionData => ({
      first_name: "",
      last_name: "",
      middle_name: "",
      birthday: "",
      phone_number: "",
      neighborhood: "",
      school: "",
    }),
    storage: new KvAdapter<SessionData>(namespace),
  });
