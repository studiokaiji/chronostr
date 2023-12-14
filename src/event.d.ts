import { type NDKEvent } from "@nostr-dev-kit/ndk";

type EventDateInput = {
  date: Date;
  includeTime: boolean;
};

type EventDate = EventDateInput & {
  id: string;
  event: NDKEvent;
};

type EventCalenderInput = {
  title: string;
  description?: string;
  dates: EventDateInput[];
};

type EventCalender = Omit<EventCalenderInput, "dates"> & {
  event: NDKEvent;
  id: string;
  dates: EventDate[];
};
