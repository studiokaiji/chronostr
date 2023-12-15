import { useAlert } from "@/hooks/use-alert";
import { useCallback } from "react";
import { Button, ButtonProps } from "./ui/button";
import { useNDK } from "@/hooks/use-ndk";

export const ConnectNIP07Button = (
  props: ButtonProps & { onConnect?: () => void }
) => {
  const { setAlert } = useAlert();

  const { connectToNip07 } = useNDK();

  const connect = useCallback(async () => {
    try {
      await connectToNip07();
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
  }, [connectToNip07, setAlert, props]);

  return (
    <Button onClick={connect} {...props}>
      {props.children || "Connect"}
    </Button>
  );
};
