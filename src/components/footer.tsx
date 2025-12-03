import { useI18n } from "@/hooks/use-i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <div className="px-4 border-gray-200 text-center text-gray-500">
      <p className="font-semibold">{t.common.chronostr}</p>
      <p className="text-sm">{t.common.tagline}</p>
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
