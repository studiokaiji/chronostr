export const Footer = () => {
  return (
    <div className="px-4 border-gray-200 text-center text-gray-500">
      <p className="font-semibold">chronostr</p>
      <p className="text-sm">
        A scheduling adjustment and RSVP tool working on the Nostr.
      </p>
      <div className="text-sm mt-2">
        <a
          href="https://github.com/studiokaiji/chronostr"
          className="underline"
        >
          GitHub
        </a>
        ・
        <a href="https://nostter.app/studiokaiji.com" className="underline">
          Nostr
        </a>
      </div>
    </div>
  );
};
