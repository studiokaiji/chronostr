import { NDKUser } from "@nostr-dev-kit/ndk";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { useNDK } from "@/hooks/use-ndk";
import { getUserProfile } from "@/services/user";
import { useEffect } from "react";

type UserProps = {
  user: NDKUser;
  type?: "info" | "onlyIcon";
};

const infoImageClass = "w-6 h-6 rounded-full border";
const onlyIconImageClass = "w-10 h-10 rounded-full border";

export const User = ({ user, type = "onlyIcon" }: UserProps) => {
  const { ndk } = useNDK();

  const { data } = useQuery({
    queryKey: [ndk, user.npub],
    queryFn: async ({ queryKey }) => {
      console.log("fetch", queryKey);
      if (!ndk || !user) {
        return;
      }
      const profile = await getUserProfile(ndk, user);
      console.log("profile", profile);
      return profile;
    },
  });

  const imageClass = type === "info" ? infoImageClass : onlyIconImageClass;

  return (
    <div className="flex items-center space-x-1">
      {data?.image ? (
        <img src={data?.image} className={imageClass} />
      ) : (
        <Skeleton className={imageClass} />
      )}
      {type === "info" && (
        <span className="text-gray-500">{data?.displayName}</span>
      )}
    </div>
  );
};
