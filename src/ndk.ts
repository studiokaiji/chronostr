import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { getRelays } from "./services/relays";

const nip07signer = new NDKNip07Signer();

let _ndk: NDK;

export const getNDK = async () => {
  if (_ndk) {
    return _ndk;
  }

  const ndk = new NDK({
    signer: nip07signer,
    explicitRelayUrls: getRelays(),
  });
  await ndk.connect();
  _ndk = ndk;

  return _ndk;
};
