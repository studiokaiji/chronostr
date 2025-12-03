import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { useAlert } from "@/hooks/use-alert";
import { useI18n } from "@/hooks/use-i18n";
import { getEventCalendar, getRSVP } from "@/services/event-calender";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNDK } from "@/hooks/use-ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { CalendarTable } from "@/components/calendar-table";
import { AppLocalStorage } from "@/services/app-local-storage";
import { Helmet } from "react-helmet";
import { CalendarInfoCard } from "@/components/calendar-info-card";

const appStorage = new AppLocalStorage();

export const EventCalendarPage = () => {
  const { naddr } = useParams();
  if (!naddr) {
    throw Error();
  }

  const { t } = useI18n();
  const { setAlert } = useAlert();

  const { ndk, assignPrivateKey, signerType } = useNDK();

  // Queries
  const {
    data: calendar,
    refetch: calendarRefetch,
    isLoading: isCalendarLoading,
  } = useSuspenseQuery({
    queryKey: [ndk, naddr],
    queryFn: ({ queryKey }) => {
      const [ndk, naddr] = queryKey as [NDK, string];
      if (!ndk) {
        return null;
      }
      return getEventCalendar(ndk, naddr);
    },
  });

  const {
    data: rsvp,
    error: rsvpError,
    refetch: rsvpRefetch,
    isLoading: isRSVPLoading,
  } = useQuery({
    queryKey: [ndk, naddr, "rsvp"],
    queryFn: async ({ queryKey }) => {
      const [ndk] = queryKey as [NDK?];

      if (!ndk || !calendar) {
        return null;
      }

      try {
        const rsvp = await getRSVP(ndk, calendar.dates, true);
        return rsvp;
      } catch (e) {
        setAlert({
          title: t.event.rsvpFetchError,
          description: String(e),
        });
        throw e;
      }
    },
  });

  useEffect(() => {
    if (rsvpError) {
      setAlert({
        title: rsvpError.name,
        description: rsvpError?.message,
        variant: "destructive",
      });
    }
  }, [rsvpError, setAlert]);

  useEffect(() => {
    if (!calendar || ndk?.activeUser) {
      return;
    }

    const privKey = appStorage.getItem(`${calendar.id}.privateKey`);
    if (!privKey) {
      return;
    }

    assignPrivateKey(privKey).catch((e) => {
      setAlert({
        title: t.event.accountError,
        description: e,
      });
    });
  }, [assignPrivateKey, calendar, ndk?.activeUser, setAlert, t]);

  const submitErrorHandler = (e: unknown) => {
    setAlert({
      title: t.event.failedToSubmit,
      description: String(e),
      variant: "destructive",
    });
  };

  if (!calendar) {
    return <></>;
  }

  return (
    <Layout>
      <Helmet>
        <title>{calendar.title} | {t.common.chronostr}</title>
      </Helmet>
      <div className="space-y-4">
        {rsvp && !isRSVPLoading && (
          <CalendarInfoCard
            pubkey={ndk?.activeUser?.pubkey || ""}
            calendar={calendar}
            rsvp={rsvp}
            isRSVPLoading={isRSVPLoading}
            calendarRefetch={calendarRefetch}
            rsvpRefetch={rsvpRefetch}
            onSubmitError={submitErrorHandler}
            signerType={signerType}
            displayAction
            displayRSVP
          />
        )}
        {!isCalendarLoading && !isRSVPLoading && (
          <Card>
            <CalendarTable calendar={calendar} rsvp={rsvp || undefined} />
          </Card>
        )}
      </div>
    </Layout>
  );
};
