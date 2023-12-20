import { Link } from "react-router-dom";
import { ConnectNIP07Button } from "./connect-nip07-button";
import { useNDK } from "@/hooks/use-ndk";
import { Button } from "./ui/button";

export const Header = () => {
  const { ndk, isLoading, signerType, disconnectNIP07 } = useNDK();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-slate-50 bg-opacity-50 backdrop-blur-lg">
      <div className="mx-auto flex items-center justify-between">
        <Link to="/">
          <div className="font-bold select-none">chronostr</div>
        </Link>
        {isLoading ? (
          <></>
        ) : (
          <div>
            {ndk &&
              (!signerType ? (
                <ConnectNIP07Button>🔐 Login (NIP-07)</ConnectNIP07Button>
              ) : signerType === "nip07" ? (
                <Button onClick={disconnectNIP07} variant="outline">
                  Disconnect
                </Button>
              ) : (
                <></>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
