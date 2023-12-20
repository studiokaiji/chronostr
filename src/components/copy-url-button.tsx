import { useAlert } from "@/hooks/use-alert";
import { CopyIcon } from "./icons/copy-icon";
import { Button } from "./ui/button";
import { useState } from "react";
import { CheckIcon } from "./icons/check-icon";

type CopyUrlButton = {
  url: string;
};

export const CopyUrlButton = ({ url }: CopyUrlButton) => {
  const { setAlert } = useAlert();

  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setAlert({
        title: "Copied!",
        lifetimeMs: 1500,
      });
      setCopied(true);

      const t = setTimeout(() => {
        setCopied(false);
      }, 1500);

      return () => clearTimeout(t);
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
