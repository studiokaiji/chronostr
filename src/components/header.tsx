import { Link } from "react-router-dom";
import { ConnectNIP07Button } from "./connect-nip07-button";
import { User } from "./user";
import { useNDK } from "@/hooks/use-ndk";

export const Header = () => {
  const { ndk, isLoading } = useNDK();

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
            {ndk?.signer ? (
              <User user={ndk.activeUser!} />
            ) : (
              <ConnectNIP07Button>🔐 Login (NIP-07)</ConnectNIP07Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
