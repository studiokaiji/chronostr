import NDK, { NDKNip07Signer, NDKSigner } from "@nostr-dev-kit/ndk";
import { getRelays } from "./services/relays";
import { AppLocalStorage } from "./services/app-local-storage";

let _ndk: NDK;

export const getNDK = async (signer?: NDKSigner) => {
  if (_ndk && !signer) {
    return _ndk;
  }

  const appStorage = new AppLocalStorage();

  if (appStorage.getItem("connected")) {
    signer = new NDKNip07Signer();
  }

  const ndk = new NDK({
    explicitRelayUrls: getRelays(),
    signer,
  });
  await ndk.connect();
  _ndk = ndk;

  if (signer) {
    appStorage.setItem("connected", String(true));
  }

  return _ndk;
};
