import {
  CALENDAR_EVENT_RSVP_KIND,
  DRAFT_CALENDAR_KIND,
  DRAFT_DATE_BASED_CALENDAR_EVENT_KIND,
  DRAFT_TIME_BASED_CALENDAR_EVENT_KIND,
} from "@/consts";
import {
  EventCalendar,
  EventCalendarInput,
  EventDate,
  EventRSVPInput,
  RSVPPerUsers,
  RSVPStatus,
} from "@/event";
import NDK, {
  NDKEvent,
  NDKFilter,
  NDKPrivateKeySigner,
  serializeProfile,
} from "@nostr-dev-kit/ndk";
import { AppLocalStorage } from "./app-local-storage";

export const createEventCalendar = async (
  ndk: NDK,
  input: EventCalendarInput
) => {
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
    return ["a", ev.tagId()];
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

export const getEventCalendar = async (ndk: NDK, naddr: string) => {
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
      id: ev.tagId(),
      event: ev,
    };
    dates.push(eventDate);
  }
  const calendar: EventCalendar = {
    title: calendarEvent.tagValue("title") || "",
    description: calendarEvent.content,
    dates,
    event: calendarEvent,
    id: calendarEvent.tagId(),
  };

  return calendar;
};

export const rsvpEvent = async (
  ndk: NDK,
  input: EventRSVPInput,
  beforeRSVPEvents?: NDKEvent[]
) => {
  if (
    beforeRSVPEvents &&
    (beforeRSVPEvents.length !== input.rsvpList.length || !ndk.signer)
  ) {
    throw Error("Invalid Request");
  }

  let signer: NDKPrivateKeySigner | undefined;

  const promises: Promise<unknown>[] = [];

  // nameが指定されている場合はprivateを指定
  if (input.name) {
    signer = NDKPrivateKeySigner.generate();

    const user = await signer.user();

    let publishRequired = true;

    if (beforeRSVPEvents) {
      const profile = await user.fetchProfile({
        pool: ndk.pool,
      });
      publishRequired = profile?.displayName !== input.name;
    }

    if (publishRequired) {
      user.profile ??= {};
      user.profile.displayName = input.name;
      user.profile.about = "chronostr anonymous user";

      const event = new NDKEvent(ndk);
      event.content = serializeProfile(user.profile);
      event.kind = 0;

      await event.sign(signer);

      const appStorage = new AppLocalStorage();

      promises.push(
        (async () => {
          await event.publish();
          appStorage.setItem(
            `${input.calenderId}.privateKey`,
            signer.privateKey || ""
          );
        })()
      );
    }
  }

  const events = await Promise.all(
    input.rsvpList.map(async (rsvp, i) => {
      const ev = new NDKEvent(ndk);
      ev.kind = CALENDAR_EVENT_RSVP_KIND;

      const tags = [];

      tags.push(["a", rsvp.date.id]);

      if (beforeRSVPEvents) {
        const dTag = beforeRSVPEvents[i]?.replaceableDTag();
        if (!dTag) {
          throw Error("Before RSVP event d tag is invalid");
        }
        tags.push(["d", dTag]);
      } else {
        tags.push(["d", crypto.randomUUID()]);
      }

      tags.push(["L", "status"]);
      tags.push(["l", rsvp.status, "status"]);

      ev.tags = tags;

      await ev.sign(signer);

      promises.push(ev.publish());

      return ev;
    })
  );

  await Promise.all(promises);

  return events;
};

export const getRSVP = async (
  ndk: NDK,
  dates: EventDate[],
  fetchProfiles = false
) => {
  const aTags = dates.map((date) => date.event.tagId());

  const events = await ndk.fetchEvents([
    {
      kinds: [Number(CALENDAR_EVENT_RSVP_KIND)],
      "#a": aTags,
    },
  ]);

  const rsvpPerUsers: RSVPPerUsers = {};

  const promises: Promise<unknown>[] = [];

  const totalMap: {
    [id: string]: {
      [status in RSVPStatus]: number;
    };
  } = {};

  events.forEach((ev) => {
    const user = ev.author;

    if (!rsvpPerUsers[user.pubkey]) {
      rsvpPerUsers[user.pubkey] = {
        user: user,
        rsvp: {},
      };
      if (fetchProfiles) {
        promises.push(
          rsvpPerUsers[user.pubkey].user.fetchProfile().catch(() => {
            return {};
          })
        );
      }
    }

    const statusTags = ev
      .getMatchingTags("l")
      .filter((tag) => tag[2] === "status");
    if (!statusTags || statusTags.length < 1) {
      return;
    }

    const statusTag = statusTags[0];
    const status = statusTag[1] as RSVPStatus;
    if (
      status !== "accepted" &&
      status !== "tentative" &&
      status !== "declined"
    ) {
      return;
    }

    const aTag = ev.tagValue("a");
    if (!aTag) {
      return;
    }

    if (!rsvpPerUsers[user.pubkey].rsvp[aTag]) {
      rsvpPerUsers[user.pubkey].rsvp[aTag] = {
        event: ev,
        status,
      };

      totalMap[aTag] ??= {
        declined: 0,
        tentative: 0,
        accepted: 0,
      };

      totalMap[aTag][status]++;
    }
  });

  const totals = dates.map((date) => totalMap[date.id]);

  if (promises.length) {
    await Promise.all(promises);
  }

  return {
    rsvpPerUsers,
    totals,
  };
};
