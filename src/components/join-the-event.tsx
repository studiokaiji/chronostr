import { formatDate } from "@/lib/formatDate";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { TextField } from "./ui/text-field";
import { EventCalendar, RSVP, RSVPStatus } from "@/event";
import { FormEvent, memo, useCallback, useEffect, useState } from "react";
import { CircleIcon } from "./icons/circle-icon";
import { TriangleIcon } from "./icons/triangle-icon";
import { CloseIcon } from "./icons/close-icon";
import { Label } from "./ui/label";
import { ConnectNIP07Button } from "./connect-nip07-button";
import { useNDK } from "@/hooks/use-ndk";
import { rsvpEvent } from "@/services/event-calender";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import { Spinner } from "./ui/spinner";

type JoinTheEventProps = {
  eventCalender: EventCalendar;
  beforeRSVP?: RSVP;
  name?: string;
  onRSVPComplete?: (events: NDKEvent[]) => void;
  onRSVPError?: (e: unknown) => void;
};

const rsvpButtonClass = "transition-none";

const rsvpDefaultIconClass = "w-5 h-5 fill-gray-500";
const rsvpActiveIconClass = "w-5 h-5 fill-white";

export const JoinTheEvent = memo(
  ({
    eventCalender,
    beforeRSVP,
    onRSVPComplete,
    onRSVPError,
    name: inputName,
  }: JoinTheEventProps) => {
    const [name, setName] = useState<string>(inputName || "");

    const [rsvpStatuses, setRSVPStatuses] = useState<RSVPStatus[]>(
      beforeRSVP
        ? eventCalender.dates.map(
            (date) => beforeRSVP?.[date.id]?.status || "declined"
          )
        : Array(eventCalender.dates.length).fill("declined")
    );

    const changeRSVP = useCallback((index: number, rsvp: RSVPStatus) => {
      setRSVPStatuses((before) => {
        const list = [...before];
        list.splice(index, 1, rsvp);
        return list;
      });
    }, []);

    const { ndk } = useNDK();

    const [displayAuthConfirm, setDisplayAuthConfirm] = useState(
      !ndk?.signer && window.nostr
    );

    useEffect(() => {
      setDisplayAuthConfirm(!ndk?.signer && window.nostr);
    }, [ndk]);

    const [isLoading, setIsLoading] = useState(false);

    if (displayAuthConfirm) {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <p className="font-semibold text-lg">Connect to Nostr Account?</p>
          <p className="text-gray-500">
            If you connect your Nostr account, your profile will be
            automatically filled in, and you will be able to make changes to
            your schedule from other browsers as well.
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setDisplayAuthConfirm(false)}
            >
              No Thanks
            </Button>
            <ConnectNIP07Button
              onConnect={() => setDisplayAuthConfirm(false)}
            />
          </div>
        </div>
      );
    }

    const submit = async (e: FormEvent) => {
      e.preventDefault();
      if (!ndk) {
        return;
      }

      try {
        setIsLoading(true);

        const rsvpList = eventCalender.dates.map((date, i) => {
          const status = rsvpStatuses[i];
          return { status, date };
        });

        const beforeRSVPEvents = beforeRSVP
          ? Object.values(beforeRSVP).map(({ event }) => event)
          : undefined;

        const res = await rsvpEvent(
          ndk,
          {
            name,
            rsvpList,
            calenderId: eventCalender.id,
          },
          beforeRSVPEvents
        );

        if (onRSVPComplete) {
          onRSVPComplete(res);
        }
      } catch (e) {
        if (onRSVPError) {
          onRSVPError(e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <form className="space-y-4" onSubmit={submit}>
        <p className="font-semibold">{eventCalender.title}</p>
        {!ndk?.signer && (
          <TextField
            label="📛 Name"
            required
            name={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <div>
          <Label>
            <span className="text-red-500">* </span>
            🗓️ Candidate dates
          </Label>
          <div className="space-y-3 mt-1.5">
            {eventCalender.dates.map((date, i) => {
              const status = rsvpStatuses[i];
              return (
                <div
                  id={`join-${date.id}`}
                  className="flex justify-between items-center"
                >
                  <div className="text-sm font-semibold">
                    {formatDate(date.date)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      className={rsvpButtonClass}
                      variant={status === "accepted" ? "default" : "secondary"}
                      size="icon"
                      type="button"
                      onClick={() => changeRSVP(i, "accepted")}
                    >
                      <CircleIcon
                        className={
                          status === "accepted"
                            ? rsvpActiveIconClass
                            : rsvpDefaultIconClass
                        }
                      />
                    </Button>
                    <Button
                      className={rsvpButtonClass}
                      variant={status === "tentative" ? "default" : "secondary"}
                      size="icon"
                      type="button"
                      onClick={() => changeRSVP(i, "tentative")}
                    >
                      <TriangleIcon
                        className={
                          status === "tentative"
                            ? rsvpActiveIconClass
                            : rsvpDefaultIconClass
                        }
                      />
                    </Button>
                    <Button
                      className={rsvpButtonClass}
                      variant={status === "declined" ? "default" : "secondary"}
                      size="icon"
                      type="button"
                      onClick={() => changeRSVP(i, "declined")}
                    >
                      <CloseIcon
                        className={
                          status === "declined"
                            ? rsvpActiveIconClass
                            : rsvpDefaultIconClass
                        }
                      />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Button className="w-full space-x-1 flex items-center" type="submit">
          {isLoading && <Spinner />} <span>Submit</span>
        </Button>
      </form>
    );
  }
);

export const JoinTheEventDialog = (
  props: JoinTheEventProps & { isLoading?: boolean }
) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        <Button disabled={props.isLoading}>
          {props.isLoading ? (
            <Spinner />
          ) : props.beforeRSVP ? (
            "📝 Re Schedule"
          ) : (
            "✋ Join"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-screen">
        <JoinTheEvent
          {...props}
          onRSVPComplete={(events) => {
            if (props.onRSVPComplete) {
              props.onRSVPComplete(events);
            }
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
