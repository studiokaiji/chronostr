import NDK from "@nostr-dev-kit/ndk";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";

export const ndkContext = createContext<NDK | null>(null);
export const setNDKContext = createContext<
  Dispatch<SetStateAction<NDK | null>>
>(() => undefined);

export const NDKContextProvider = ({ children }: { children: ReactNode }) => {
  const [ndk, setNDK] = useState<NDK | null>(null);

  return (
    <ndkContext.Provider value={ndk}>
      <setNDKContext.Provider value={setNDK}>{children}</setNDKContext.Provider>
    </ndkContext.Provider>
  );
};
