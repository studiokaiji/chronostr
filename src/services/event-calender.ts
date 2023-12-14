import {
  DRAFT_CALENDAR_KIND,
  DRAFT_DATE_BASED_CALENDAR_EVENT_KIND,
  DRAFT_TIME_BASED_CALENDAR_EVENT_KIND,
} from "@/consts";
import { EventCalender, EventCalenderInput, EventDate } from "@/event";
import { getNDK } from "@/ndk";
import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";

export const createEventCalendar = async (input: EventCalenderInput) => {
  const ndk = await getNDK();

  // Create Draft Date/Time Calendar Events
  const candidateDateEvents = await Promise.all(
    input.dates.map(async (date, i) => {
      const kind = date.includeTime
        ? DRAFT_TIME_BASED_CALENDAR_EVENT_KIND
        : DRAFT_DATE_BASED_CALENDAR_EVENT_KIND;

      // tags
      const tags = [];

      tags.push(["d", crypto.randomUUID()]);
      tags.push(["name", `${input.title}-candidate-dates-${i}`]);

      const start = date.includeTime
        ? String(Math.floor(date.date.getTime() / 1000))
        : date.date.toISOString();
      tags.push(["start", start]);

      const content = input.description || "";

      const ev = new NDKEvent(ndk);
      ev.kind = kind;
      ev.tags = tags;
      ev.content = content;

      await ev.sign();

      return ev;
    })
  );

  // Create Draft Calendar Event
  const draftCalendarEvent = new NDKEvent(ndk);
  draftCalendarEvent.kind = DRAFT_CALENDAR_KIND;

  const aTags = candidateDateEvents.map((ev) => {
    const dTag = ev.tags.find((tags) => tags[0] === "d");
    if (!dTag) {
      throw Error("Invalid event");
    }
    return ["a", `${ev.kind}:${ev.pubkey}:${dTag[1]}`];
  });

  draftCalendarEvent.tags = [
    ["d", crypto.randomUUID()],
    ["title", input.title],
    ...aTags,
  ];
  draftCalendarEvent.content = input.description || "";

  await draftCalendarEvent.sign();

  // Publish all
  await Promise.all([
    ...candidateDateEvents.map((ev) => ev.publish()),
    draftCalendarEvent.publish(),
  ]);

  return draftCalendarEvent;
};

export const getEventCalendar = async (naddr: string) => {
  const ndk = await getNDK();

  const calendarEvent = await ndk.fetchEvent(naddr);
  if (!calendarEvent) {
    return null;
  }

  const aTags = calendarEvent.getMatchingTags("a");
  const filters: NDKFilter[] = [];

  for (const tag of aTags) {
    const splitted = tag[1].split(":");
    if (splitted.length < 3) {
      continue;
    }

    const [kind, pubkey, identifier] = splitted;
    filters.push({
      kinds: [Number(kind)],
      authors: [pubkey],
      "#d": [identifier],
    });
  }

  const dateEvents = await ndk.fetchEvents(filters);
  const dates: EventDate[] = [];

  for (const ev of dateEvents) {
    const start = ev.tagValue("start");
    if (!start) continue;

    const includeTime = !Number.isNaN(Number(start));
    const date = new Date(start);
    if (!date || Number.isNaN(date.getTime())) {
      continue;
    }

    const eventDate: EventDate = {
      date,
      includeTime,
      id: ev.id,
      event: ev,
    };
    dates.push(eventDate);
  }
  const calendar: EventCalender = {
    title: calendarEvent.tagValue("title") || "",
    description: calendarEvent.content,
    dates,
    event: calendarEvent,
    id: calendarEvent.tagId(),
  };

  return calendar;
};
