import { Context, LazySessionFlavor, lazySession } from "grammy";
import { KvAdapter } from "./kv";

export interface Env {
  TOKEN: string;
  OWNER_ID: number;
  REKORD: KVNamespace;
}

export enum Steps {
  LAST_NAME = "last_name",
  FIRST_NAME = "first_name",
  MIDDLE_NAME = "middle_name",
  PHONE_NUMBER = "phone_number",
  BIRTHDAY = "birthday",
  NEIGHBORHOOD = "neighborhood",
  SCHOOL = "school",
}

export interface SessionData {
  subscribed: boolean;
  first_name: string;
  last_name: string;
  middle_name: string;
  birthday: string;
  phone_number: string;
  neighborhood: string;
  school: string;
}

export type TContext = Context & LazySessionFlavor<SessionData>;

export const tSession = (namespace: KVNamespace) =>
  lazySession({
    initial: (): SessionData => ({
      subscribed: false,
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
