import { RELAY_TIMEOUT } from "@/consts";
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

type SignerType = "privateKey" | "nip07";

export const ndkContext = createContext<NDK | null>(null);
export const setNDKContext = createContext<
  Dispatch<SetStateAction<NDK | null>>
>(() => undefined);
export const ndkSignerTypeContext = createContext<SignerType | null>(null);
export const setNDKSignerTypeContext = createContext<
  Dispatch<SetStateAction<SignerType | null>>
>(() => undefined);

const appStorage = new AppLocalStorage();

export const NDKContextProvider = ({ children }: { children: ReactNode }) => {
  const [ndk, setNDK] = useState<NDK | null>(null);
  const isCalledRef = useRef(false);

  const [signerType, setSignerType] = useState<SignerType | null>(null);

  useEffect(() => {
    if (!ndk && !isCalledRef.current) {
      isCalledRef.current = true;

      let signer: NDKNip07Signer | undefined = undefined;

      const strConnected = appStorage.getItem("connected");

      if (strConnected && JSON.parse(strConnected.toLowerCase())) {
        signer = new NDKNip07Signer();
        signer
          .user()
          .then(() => {
            createNewNDK(signer);
            setSignerType("nip07");
          })
          .catch(() => createNewNDK());
      } else {
        createNewNDK();
      }
    }
  }, [ndk]);

  const createNewNDK = async (signer?: NDKSigner) => {
    setNDK(null);

    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
      signer,
    });
    await newNDK.connect(RELAY_TIMEOUT);

    setNDK(newNDK);

    appStorage.setItem("connected", String(!!signer));

    return newNDK;
  };

  return (
    <ndkContext.Provider value={ndk}>
      <setNDKContext.Provider value={setNDK}>
        <ndkSignerTypeContext.Provider value={signerType}>
          <setNDKSignerTypeContext.Provider value={setSignerType}>
            {children}
          </setNDKSignerTypeContext.Provider>
        </ndkSignerTypeContext.Provider>
      </setNDKContext.Provider>
    </ndkContext.Provider>
  );
};
