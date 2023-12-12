import {
  DRAFT_CALENDAR_KIND,
  DRAFT_DATE_BASED_CALENDAR_EVENT_KIND,
  DRAFT_TIME_BASED_CALENDAR_EVENT_KIND,
} from "@/consts";
import { getNDK } from "@/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";

export const createEventCalendar = async (input: EventInput) => {
  const ndk = await getNDK();

  const user = ndk.getUser({
    pubkey: "2d417bce8c10883803bc427703e3c4c024465c88e7063ed68f9dfeecf56911ac",
  });
  console.log(await user.fetchProfile());

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

      if (input.location) {
        tags.push(["location", input.location]);
      }
      if (input.geohash) {
        tags.push(["geohash", input.geohash]);
      }

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
    return ["a", `${ev.kind}:${ev.pubkey}:${dTag}`];
  });

  draftCalendarEvent.tags = [["d", crypto.randomUUID()], ...aTags];

  await draftCalendarEvent.sign();

  console.log(draftCalendarEvent.rawEvent());

  // Publish all
  await Promise.all([
    ...candidateDateEvents.map((ev) => ev.publish()),
    draftCalendarEvent.publish(),
  ]);

  return draftCalendarEvent;
};
