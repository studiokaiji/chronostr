import { Link } from "react-router-dom";
import { ConnectNIP07Button } from "./connect-nip07-button";
import { useI18n } from "@/hooks/use-i18n";
import { useNDK } from "@/hooks/use-ndk";
import { Button } from "./ui/button";

export const Header = () => {
  const { ndk, isLoading, signerType, disconnectNIP07 } = useNDK();
  const { t, locale, toggleLocale } = useI18n();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-slate-50 bg-opacity-50 backdrop-blur-lg">
      <div className="mx-auto flex items-center justify-between">
        <Link to="/">
          <div className="font-bold select-none">{t.common.chronostr}</div>
        </Link>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleLocale}>
            {locale === "en" ? "🇯🇵 日本語" : "🇺🇸 English"}
          </Button>
          {isLoading ? (
            <></>
          ) : (
            <>
              {ndk &&
                (!signerType ? (
                  <ConnectNIP07Button>
                    🔐 {t.header.login}
                  </ConnectNIP07Button>
                ) : signerType === "nip07" ? (
                  <Button onClick={disconnectNIP07} variant="outline">
                    {t.common.disconnect}
                  </Button>
                ) : (
                  <></>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
