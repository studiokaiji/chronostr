import { DEFAULT_RELAYS } from "@/consts";
import { AppLocalStorage } from "./app-local-storage";

const localKV = new AppLocalStorage();

export const getRelays = () => {
  const item = localKV.getItem("relays");
  if (!item) {
    return DEFAULT_RELAYS;
  }

  const parsed = JSON.parse(item);
  if (!Array.isArray(parsed)) {
    return DEFAULT_RELAYS;
  }

  return parsed as string[];
};

export const setRelays = (relays: string[]) => {
  const key = `relays`;
  localStorage.setItem(key, JSON.stringify(relays));
};
