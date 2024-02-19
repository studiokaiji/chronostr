import { NDKUser } from "@nostr-dev-kit/ndk";

export const getName = (user: NDKUser) =>
  user.profile?.displayName || user.profile?.name || user.npub;
