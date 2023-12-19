import { ndkContext, setNDKContext } from "@/contexts/ndk-context";
import { AppLocalStorage } from "@/services/app-local-storage";
import { getRelays } from "@/services/relays";
import NDK, { NDKNip07Signer, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { useContext, useState } from "react";

const appStorage = new AppLocalStorage();

export const useNDK = () => {
  const ndk = useContext(ndkContext);
  const setNDK = useContext(setNDKContext);

  const [isLoading, setIsLoading] = useState(true);

  const connectToNip07 = async () => {
    setIsLoading(true);

    const signer = new NDKNip07Signer();
    if (!(await signer.blockUntilReady())) {
      throw Error("Signer is not ready.");
    }

    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
      signer,
    });

    await newNDK.connect();

    setNDK(newNDK);
    setIsLoading(false);

    appStorage.setItem("connected", String(true));

    return newNDK;
  };

  const assignPrivateKey = async (privKey: string) => {
    setIsLoading(true);

    const signer = new NDKPrivateKeySigner(privKey);

    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
      signer,
    });

    await newNDK.connect();

    setNDK(newNDK);
    setIsLoading(false);

    return newNDK;
  };

  return { ndk, isLoading, connectToNip07, assignPrivateKey };
};
