import { CalendarInfoCard } from "@/components/calendar-info-card";
import { Layout } from "@/components/layout";
import { Spinner } from "@/components/ui/spinner";
import { useAlert } from "@/hooks/use-alert";
import { useNDK } from "@/hooks/use-ndk";
import { getJoinedCalendarEvents } from "@/services/event-calender";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

export const MyPage = () => {
  const { ndk, isLoading } = useNDK();

  const navigate = useNavigate();
  const { setAlert } = useAlert();

  useEffect(() => {
    if (!ndk && !isLoading) {
      setAlert({
        title: "Please connect to NIP-07 client first.",
      });
      navigate("/", { replace: true });
    }
  }, [ndk, isLoading, setAlert, navigate]);

  return (
    <>
      <Helmet>
        <title>MyPage | chronostr</title>
      </Helmet>
      <Layout>
        {!isLoading && ndk && (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">My Page</h1>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-500">
                Joined Events
              </h2>
              <Suspense fallback={<Spinner />}>
                <JoinedEvents />
              </Suspense>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};

const JoinedEvents = () => {
  const { ndk, signerType } = useNDK();
  const { data } = useSuspenseQuery({
    queryKey: [ndk, "getJoinedCalendarEvents"],
    queryFn: () => {
      if (!ndk || !ndk.activeUser?.pubkey) {
        return null;
      }
      return getJoinedCalendarEvents(ndk, ndk.activeUser?.pubkey);
    },
  });

  if (!data) {
    return <></>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((calendar) => (
        <Link
          key={calendar.id}
          to={`/events/${calendar.id}`}
          className="hover:scale-105 border-yellow-400 transition duration-300"
        >
          <CalendarInfoCard
            pubkey={ndk?.activeUser?.pubkey || ""}
            calendar={calendar}
            isRSVPLoading={false}
            signerType={signerType}
            small
          />
        </Link>
      ))}
    </div>
  );
};
