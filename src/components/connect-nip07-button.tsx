import { useAlert } from "@/hooks/use-alert";
import { getNDK } from "@/ndk";
import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { useCallback } from "react";
import { Button, ButtonProps } from "./ui/button";

export const ConnectNIP07Button = (
  props: ButtonProps & { onConnect?: () => void }
) => {
  const { setAlert } = useAlert();

  const connect = useCallback(async () => {
    try {
      await getNDK(new NDKNip07Signer());
      setAlert({
        title: "Account Connected!",
      });
      if (props.onConnect) props.onConnect();
    } catch (e) {
      setAlert({
        title: "Failed to connect",
        description: String(e),
        variant: "destructive",
      });
    }
  }, [setAlert, props]);

  return (
    <Button onClick={connect} {...props}>
      {props.children || "Connect"}
    </Button>
  );
};
