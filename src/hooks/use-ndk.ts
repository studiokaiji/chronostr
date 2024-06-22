import { RELAY_TIMEOUT } from "@/consts";
import {
  ndkContext,
  ndkSignerTypeContext,
  setNDKContext,
  setNDKSignerTypeContext,
} from "@/contexts/ndk-context";
import { AppLocalStorage } from "@/services/app-local-storage";
import { getRelays } from "@/services/relays";
import NDK, { NDKNip07Signer, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { useContext, useEffect, useState } from "react";

const appStorage = new AppLocalStorage();

export const useNDK = () => {
  const ndk = useContext(ndkContext);
  const setNDK = useContext(setNDKContext);

  const signerType = useContext(ndkSignerTypeContext);
  const setSignerType = useContext(setNDKSignerTypeContext);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ndk) {
      setIsLoading(false);
    }
  }, [ndk]);

  const connectToNip07 = async () => {
    setIsLoading(true);

    const signer = new NDKNip07Signer();
    if (!(await signer.user())) {
      throw Error("Signer is not ready.");
    }

    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
      signer,
    });

    await newNDK.connect(RELAY_TIMEOUT);

    setNDK(newNDK);
    setIsLoading(false);
    setSignerType("nip07");

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

    await newNDK.connect(RELAY_TIMEOUT);

    setNDK(newNDK);
    setIsLoading(false);
    setSignerType("privateKey");

    return newNDK;
  };

  const disconnectNIP07 = async () => {
    setIsLoading(true);

    setSignerType(null);
    const newNDK = new NDK({
      explicitRelayUrls: getRelays(),
    });
    await newNDK.connect(RELAY_TIMEOUT);

    appStorage.setItem("connected", String(false));

    setIsLoading(false);
  };

  return {
    ndk,
    isLoading,
    signerType,
    connectToNip07,
    disconnectNIP07,
    assignPrivateKey,
  };
};
