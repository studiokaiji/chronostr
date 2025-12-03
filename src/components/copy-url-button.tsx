import { useAlert } from "@/hooks/use-alert";
import { useI18n } from "@/hooks/use-i18n";
import { CopyIcon } from "./icons/copy-icon";
import { Button } from "./ui/button";
import { useState } from "react";
import { CheckIcon } from "./icons/check-icon";

type CopyUrlButton = {
  url: string;
};

export const CopyUrlButton = ({ url }: CopyUrlButton) => {
  const { t } = useI18n();
  const { setAlert } = useAlert();

  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setAlert({
        title: t.common.copied,
        lifetimeMs: 1500,
      });
      setCopied(true);

      const timer = setTimeout(() => {
        setCopied(false);
      }, 1500);

      return () => clearTimeout(timer);
    });
  };

  return (
    <Button size="icon" variant="secondary" onClick={copy}>
      {copied ? (
        <CheckIcon className="w-[18px] h-[18px] fill-gray-700" />
      ) : (
        <CopyIcon className="w-[18px] h-[18px] fill-gray-700" />
      )}
    </Button>
  );
};
