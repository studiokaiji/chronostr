import type { NDKUser, NDKEvent } from "@nostr-dev-kit/ndk";

type EventDateInput = {
  date: Date;
  includeTime: boolean;
};

type EventDate = EventDateInput & {
  id: string;
  event: NDKEvent;
};

type EventCalendarInput = {
  title: string;
  description?: string;
  dates: EventDateInput[];
};

type EventCalendar = Omit<EventCalendarInput, "dates"> & {
  event: NDKEvent;
  id: string;
  dates: EventDate[];
};

type RSVPStatus = "accepted" | "declined" | "tentative";

type EventRSVPInput = {
  name?: string;
  rsvpList: {
    date: EventDate;
    status: RSVPStatus;
  }[];
  calenderId: string;
  comment?: string;
};

type RSVP = {
  [id in string]: {
    status: RSVPStatus;
    event: NDKEvent;
  };
};

type RSVPPerUsers = {
  [pubkey in string]: {
    user: NDKUser;
    rsvp: {
      [id in string]: {
        status: RSVPStatus;
        event: NDKEvent;
      };
    };
  };
};

type RSVPTotal = {
  [status in RSVPStatus]: number;
};

type GetRSVPResponse = {
  rsvpPerUsers: RSVPPerUsers;
  totals: RSVPTotal[];
};
