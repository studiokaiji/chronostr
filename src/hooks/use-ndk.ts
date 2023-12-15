import { ndkContext, setNDKContext } from "@/contexts/ndk-context";
import { AppLocalStorage } from "@/services/app-local-storage";
import { getRelays } from "@/services/relays";
import NDK, { NDKNip07Signer, NDKSigner } from "@nostr-dev-kit/ndk";
import { useContext, useEffect, useState } from "react";

const appStorage = new AppLocalStorage();

export const useNDK = () => {
  const ndk = useContext(ndkContext);
  const setNDK = useContext(setNDKContext);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ndk) {
      try {
        let signer: NDKNip07Signer | undefined = undefined;

        const strConnected = appStorage.getItem("connected");

        if (strConnected && JSON.parse(strConnected.toLowerCase())) {
          signer = new NDKNip07Signer();
        }
        createNewNDK(signer);
      } catch (e) {
        console.log(e);
        createNewNDK();
        appStorage.setItem("connected", String(false));
      }
    }
  }, []);

  const connectToNip07 = async () => {
    setIsLoading(true);
    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
      signer: new NDKNip07Signer(),
    });
    await newNDK.connect();

    setNDK(newNDK);
    setIsLoading(false);
    appStorage.setItem("connected", String(true));
  };

  const createNewNDK = (signer?: NDKSigner) => {
    setIsLoading(true);

    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
      signer,
    });

    newNDK
      .connect()
      .then(() => {
        setNDK(newNDK);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { ndk, isLoading, connectToNip07 };
};
