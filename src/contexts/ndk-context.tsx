import { AppLocalStorage } from "@/services/app-local-storage";
import { getRelays } from "@/services/relays";
import NDK, { NDKNip07Signer, NDKSigner } from "@nostr-dev-kit/ndk";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const ndkContext = createContext<NDK | null>(null);
export const setNDKContext = createContext<
  Dispatch<SetStateAction<NDK | null>>
>(() => undefined);

const appStorage = new AppLocalStorage();

export const NDKContextProvider = ({ children }: { children: ReactNode }) => {
  const [ndk, setNDK] = useState<NDK | null>(null);
  const isCalledRef = useRef(false);

  useEffect(() => {
    if (!ndk && !isCalledRef.current) {
      isCalledRef.current = true;

      let signer: NDKNip07Signer | undefined = undefined;

      const strConnected = appStorage.getItem("connected");

      if (strConnected && JSON.parse(strConnected.toLowerCase())) {
        signer = new NDKNip07Signer();
        signer
          .blockUntilReady()
          .then(() => createNewNDK(signer))
          .catch(() => createNewNDK());
      } else {
        createNewNDK();
      }
    }
  }, []);

  const createNewNDK = async (signer?: NDKSigner) => {
    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
      signer,
    });
    await newNDK.connect();

    setNDK(newNDK);

    appStorage.setItem("connected", String(!!signer));

    return newNDK;
  };

  return (
    <ndkContext.Provider value={ndk}>
      <setNDKContext.Provider value={setNDK}>{children}</setNDKContext.Provider>
    </ndkContext.Provider>
  );
};
