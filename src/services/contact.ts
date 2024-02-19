import NDK, { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

export const contactEvent = async (
  ndk: NDK,
  body: string,
  users: NDKUser[]
) => {
  const ev = new NDKEvent(ndk);
  ev.kind = 1;
  ev.content = body;

  const tags = [];
  for (const user of users) {
    tags.push(["p", user.pubkey]);
  }
  ev.tags = tags;

  await ev.sign();
  await ev.publish();

  return ev;
};
