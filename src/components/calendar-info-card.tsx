import { formatDate } from "@/lib/formatDate";
import { ContactDialog } from "./contact";
import { CopyUrlButton } from "./copy-url-button";
import { EventEditorDialog } from "./event-editor";
import { JoinTheEventDialog } from "./join-the-event";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { EventCalendar, GetRSVPResponse } from "@/event";
import { User } from "./user";
import { useMemo } from "react";

type CalendarInfoCardProps = {
  pubkey: string;
  calendar: EventCalendar;
  rsvp?: GetRSVPResponse;
  isRSVPLoading?: boolean;
  calendarRefetch?: () => void;
  rsvpRefetch?: () => void;
  onSubmitError?: (error: unknown) => void;
  signerType: "nip07" | "privateKey" | null;
  displayAction?: boolean;
  displayRSVP?: boolean;
  small?: boolean;
};

export const CalendarInfoCard = ({
  pubkey,
  calendar,
  rsvp,
  isRSVPLoading = false,
  calendarRefetch,
  rsvpRefetch,
  onSubmitError,
  signerType,
  displayAction,
  small,
  displayRSVP,
}: CalendarInfoCardProps) => {
  const isOwner = calendar.owner.npub === pubkey;

  const myRSVP = useMemo(() => {
    if (!rsvp) return undefined;
    if (pubkey in rsvp.rsvpPerUsers) {
      return rsvp.rsvpPerUsers?.[pubkey];
    }
    return undefined;
  }, [pubkey, rsvp]);

  return (
    <Card
      className={`grow flex items-stretch justify-between ${
        small ? "p-5" : "p-6"
      }`}
    >
      <div className="w-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between w-full">
            <CardTitle className={small ? "" : "text-3xl font-bold"}>
              {calendar.title}
            </CardTitle>
            {displayAction && <CopyUrlButton url={location.href} />}
          </div>
          <a
            href={`https://nostter.app/${calendar.owner.npub}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <User user={calendar.owner} type="info" />
          </a>
          <CardDescription className={small ? "" : "text-base"}>
            {calendar.description}
          </CardDescription>
        </div>
        <div className="sm:flex justify-between items-end">
          <div
            className={`${
              small ? "mt-2" : "mt-4 mr-4"
            } text-gray-500 font-medium inline-block"`}
          >
            {displayRSVP && (
              <p>👤 {Object.keys(rsvp?.rsvpPerUsers || {}).length}</p>
            )}
            <p className={small ? "text-sm" : ""}>
              🗓️ {formatDate(calendar.dates[0].date)} ~{" "}
              {formatDate(calendar.dates.slice(-1)[0].date)}
            </p>
          </div>
          {displayAction && (
            <div className="space-x-2 inline-block mt-4 sm:mt-0">
              {isOwner ? (
                <EventEditorDialog
                  currentValue={calendar}
                  onEditComplete={() => calendarRefetch?.()}
                  onEditError={onSubmitError}
                />
              ) : (
                <ContactDialog
                  title={calendar.title}
                  rsvp={rsvp || undefined}
                  isLoading={isRSVPLoading}
                  onContactError={onSubmitError}
                />
              )}

              <JoinTheEventDialog
                eventCalender={calendar}
                beforeRSVP={myRSVP?.rsvp}
                isLoading={isRSVPLoading}
                name={
                  signerType === "privateKey"
                    ? myRSVP?.user?.profile?.name
                    : undefined
                }
                onRSVPComplete={() => rsvpRefetch?.()}
                onRSVPError={onSubmitError}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
