import { NDKUser } from "@nostr-dev-kit/ndk";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { useNDK } from "@/hooks/use-ndk";

type UserProps = {
  user: NDKUser;
};

const imageClass = "w-10 h-10 rounded-full border";

export const User = ({ user }: UserProps) => {
  const { ndk } = useNDK();

  const { data } = useQuery({
    queryKey: [user],
    queryFn: async ({ queryKey }) => {
      const [user] = queryKey;
      if (user.profile) {
        return user.profile;
      }

      const profile = await user.fetchProfile({
        pool: ndk?.pool,
      });
      return profile;
    },
  });

  return (
    <div>
      {data?.image ? (
        <img src={data?.image} className={imageClass} />
      ) : (
        <Skeleton className={imageClass} />
      )}
    </div>
  );
};
