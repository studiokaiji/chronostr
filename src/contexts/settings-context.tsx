import { Dispatch, SetStateAction, createContext, useState } from "react";

type Settings = Record<string, unknown>;

export const settingsContext = createContext<Settings>({});
export const setSettingsContext = createContext<
  Dispatch<SetStateAction<Settings>>
>(() => undefined);

export const SettingsContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<Settings>({});
  return (
    <settingsContext.Provider value={settings}>
      <setSettingsContext.Provider value={setSettings}>
        {children}
      </setSettingsContext.Provider>
    </settingsContext.Provider>
  );
};
