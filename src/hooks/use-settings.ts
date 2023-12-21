import {
  setSettingsContext,
  settingsContext,
} from "@/contexts/settings-context";
import { useContext } from "react";

export const useSettings = () => {
  const settings = useContext(settingsContext);
  const setSettings = useContext(setSettingsContext);
  return { settings, setSettings };
};
