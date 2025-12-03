import { useAlert } from "@/hooks/use-alert";
import { useI18n } from "@/hooks/use-i18n";
import { useCallback } from "react";
import { Button, ButtonProps } from "./ui/button";
import { useNDK } from "@/hooks/use-ndk";

export const ConnectNIP07Button = (
  props: ButtonProps & { onConnect?: () => void }
) => {
  const { t } = useI18n();
  const { setAlert } = useAlert();

  const { connectToNip07 } = useNDK();

  const connect = useCallback(async () => {
    try {
      await connectToNip07();
      setAlert({
        title: t.nip07.accountConnected,
      });
      if (props.onConnect) props.onConnect();
    } catch (e) {
      setAlert({
        title: t.nip07.failedToConnect,
        description: String(e),
        variant: "destructive",
      });
    }
  }, [connectToNip07, setAlert, props, t]);

  return (
    <Button onClick={connect} {...props}>
      {props.children || t.common.connect}
    </Button>
  );
};
