import NDK, { NDKUser } from "@nostr-dev-kit/ndk";

export const getUserProfile = async (ndk: NDK, user: NDKUser) => {
  if (user.profile) {
    return user.profile;
  }

  const profile = await user.fetchProfile({
    pool: ndk?.pool,
  });

  return profile;
};
