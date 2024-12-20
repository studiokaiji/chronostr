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
  EventDateInput,
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

export const updateEventCalendar = async (
  ndk: NDK,
  calendarId: string,
  addDates: EventDateInput[],
  removeDateEventTagIds: string[],
  title?: string,
  description?: string
) => {
  const calendarEvent = await ndk.fetchEvent(calendarId);
  if (!calendarEvent) {
    throw Error("Calendar Event not found");
  }
  if (!calendarEvent.dTag) {
    throw Error("Invalid Calendar Event");
  }

  const calendarWithoutDates = eventToCalendar(calendarEvent, []);
  title ??= calendarWithoutDates.title;
  description ??= calendarWithoutDates.description;

  // Create Draft Date/Time Calendar Events
  const newDateEvents = [];

  for (let i = 0; i < addDates.length; i++) {
    const date = addDates[i];
    const kind = date.includeTime
      ? DRAFT_TIME_BASED_CALENDAR_EVENT_KIND
      : DRAFT_DATE_BASED_CALENDAR_EVENT_KIND;

    // tags
    const tags = [];

    const id = crypto.randomUUID();

    tags.push(["d", id]);
    tags.push(["name", `${title}-candidate-dates-${i}`]);
    tags.push(["a", [kind, ndk.activeUser!.pubkey, calendarId].join(":")]);

    const start = date.includeTime
      ? String(Math.floor(date.date.getTime() / 1000))
      : date.date.toISOString();
    tags.push(["start", start]);

    const content = description || "";

    const ev = new NDKEvent(ndk);
    ev.kind = kind;
    ev.tags = tags;
    ev.content = content;

    await ev.sign();

    newDateEvents.push(ev);
  }

  // const newDateEvents = await Promise.all(
  //   addDates.map(async (date, i) => {
  //     const kind = date.includeTime
  //       ? DRAFT_TIME_BASED_CALENDAR_EVENT_KIND
  //       : DRAFT_DATE_BASED_CALENDAR_EVENT_KIND;

  //     // tags
  //     const tags = [];

  //     const id = crypto.randomUUID();

  //     tags.push(["d", id]);
  //     tags.push(["name", `${title}-candidate-dates-${i}`]);
  //     tags.push(["a", [kind, ndk.activeUser!.pubkey, id].join(":")]);

  //     const start = date.includeTime
  //       ? String(Math.floor(date.date.getTime() / 1000))
  //       : date.date.toISOString();
  //     tags.push(["start", start]);

  //     const content = description || "";

  //     const ev = new NDKEvent(ndk);
  //     ev.kind = kind;
  //     ev.tags = tags;
  //     ev.content = content;

  //     await ev.sign();

  //     return ev;
  //   })
  // );

  // Update Draft Calendar Event
  const currentCalendarTags = calendarEvent.getMatchingTags("a");
  const baseATags = currentCalendarTags.filter(
    (tag) => !removeDateEventTagIds.includes(tag[1])
  );

  const draftCalendarEvent = new NDKEvent(ndk);
  draftCalendarEvent.kind = DRAFT_CALENDAR_KIND;

  const newATags = newDateEvents.map((ev) => {
    const dTag = ev.tags.find((tags) => tags[0] === "d");
    if (!dTag) {
      throw Error("Invalid event");
    }
    return ["a", ev.tagId()];
  });

  draftCalendarEvent.tags = [
    ["d", calendarEvent.dTag],
    ["title", title],
    ...baseATags,
    ...newATags,
  ];
  draftCalendarEvent.content = description || "";

  await draftCalendarEvent.sign();

  // Publish
  for (const ev of newDateEvents) {
    await ev.publish();
  }

  await draftCalendarEvent.publish();

  // await Promise.all([
  //   ...newDateEvents.map((ev) => ev.publish()),
  //   draftCalendarEvent.publish(),
  // ]);

  return draftCalendarEvent;
};

export const createEventCalendar = async (
  ndk: NDK,
  input: EventCalendarInput
) => {
  const calendarId = crypto.randomUUID();

  // Create Draft Date/Time Calendar Events
  const candidateDateEvents = [];

  for (let i = 0; i < input.dates.length; i++) {
    const date = input.dates[i];
    const kind = date.includeTime
      ? DRAFT_TIME_BASED_CALENDAR_EVENT_KIND
      : DRAFT_DATE_BASED_CALENDAR_EVENT_KIND;

    // tags
    const tags = [];

    const id = crypto.randomUUID();

    tags.push(["d", id]);
    tags.push(["name", `${input.title}-candidate-dates-${i}`]);
    tags.push(["a", [kind, ndk.activeUser!.pubkey, calendarId].join(":")]);

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
    candidateDateEvents.push(ev);
  }

  // const candidateDateEvents = await Promise.all(
  //   input.dates.map(async (date, i) => {
  //     const kind = date.includeTime
  //       ? DRAFT_TIME_BASED_CALENDAR_EVENT_KIND
  //       : DRAFT_DATE_BASED_CALENDAR_EVENT_KIND;

  //     // tags
  //     const tags = [];

  //     const id = crypto.randomUUID();

  //     tags.push(["d", id]);
  //     tags.push(["name", `${input.title}-candidate-dates-${i}`]);
  //     tags.push(["a", [kind, ndk.activeUser!.pubkey, id].join(":")]);

  //     const start = date.includeTime
  //       ? String(Math.floor(date.date.getTime() / 1000))
  //       : date.date.toISOString();
  //     tags.push(["start", start]);

  //     const content = input.description || "";

  //     const ev = new NDKEvent(ndk);
  //     ev.kind = kind;
  //     ev.tags = tags;
  //     ev.content = content;

  //     await ev.sign();

  //     return ev;
  //   })
  // );

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
    ["d", calendarId],
    ["title", input.title],
    ...aTags,
  ];
  draftCalendarEvent.content = input.description || "";

  await draftCalendarEvent.sign();

  // Publish all
  for (const ev of candidateDateEvents) {
    await ev.publish();
  }

  await draftCalendarEvent.publish();

  // await Promise.all([
  //   ...candidateDateEvents.map((ev) => ev.publish()),
  //   draftCalendarEvent.publish(),
  // ]);

  return draftCalendarEvent;
};

export const getEventCalendar = async (ndk: NDK, naddrOrDTag: string) => {
  const calendarEvent = await ndk.fetchEvent(naddrOrDTag);
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
    const date = eventToDate(ev);
    if (date) {
      dates.push(date);
    }
  }

  const calendar = eventToCalendar(calendarEvent, dates);
  return calendar;
};

export const rsvpEvent = async (
  ndk: NDK,
  input: EventRSVPInput,
  beforeRSVPEvents?: NDKEvent[]
) => {
  if (beforeRSVPEvents && !ndk.signer) {
    throw Error("Invalid Request");
  }

  let signer: NDKPrivateKeySigner | undefined;

  // nameが指定されている場合はprivateを指定
  if (input.name) {
    signer = NDKPrivateKeySigner.generate();

    const user = await signer.user();
    user.ndk = ndk;

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

      await event.publish();
      appStorage.setItem(
        `${input.calenderId}.privateKey`,
        signer.privateKey || ""
      );
    }
  }

  const events = [];
  for (const rsvp of input.rsvpList) {
    const ev = new NDKEvent(ndk);
    ev.kind = CALENDAR_EVENT_RSVP_KIND;

    const tags = [];

    tags.push(["a", rsvp.date.id]);

    if (beforeRSVPEvents) {
      const currentDTag = beforeRSVPEvents.find(
        (bev) => bev.dTag && bev.dTag === rsvp.date.event.dTag
      )?.dTag;
      const dTag = currentDTag || crypto.randomUUID();
      tags.push(["d", dTag]);
    } else {
      tags.push(["d", crypto.randomUUID()]);
    }

    tags.push(["L", "status"]);
    tags.push(["l", rsvp.status, "status"]);

    ev.tags = tags;

    await ev.sign(signer);
    await ev.publish();

    events.push(ev);
  }

  // const events = await Promise.all(
  //   input.rsvpList.map(async (rsvp) => {
  //     const ev = new NDKEvent(ndk);
  //     ev.kind = CALENDAR_EVENT_RSVP_KIND;

  //     const tags = [];

  //     tags.push(["a", rsvp.date.id]);

  //     if (beforeRSVPEvents) {
  //       const currentDTag = beforeRSVPEvents.find(
  //         (bev) => bev.dTag && bev.dTag === rsvp.date.event.dTag
  //       )?.dTag;
  //       const dTag = currentDTag || crypto.randomUUID();
  //       tags.push(["d", dTag]);
  //     } else {
  //       tags.push(["d", crypto.randomUUID()]);
  //     }

  //     tags.push(["L", "status"]);
  //     tags.push(["l", rsvp.status, "status"]);

  //     ev.tags = tags;

  //     await ev.sign(signer);

  //     return ev;
  //   })
  // );

  for (const ev of events) {
    await ev.publish();
  }

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
          rsvpPerUsers[user.pubkey].user?.fetchProfile().catch((e) => {
            console.error(e);
            return null;
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
    await new Promise<void>((resolve) => {
      Promise.allSettled(promises).then(() => resolve());
      setTimeout(() => {
        resolve();
      }, 3000);
    });
  }

  return {
    rsvpPerUsers,
    totals,
  };
};

export const eventToCalendar = (
  event: NDKEvent,
  dates: EventDate[]
): EventCalendar => {
  const sortedDates = dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  return {
    title: event.tagValue("title") || "",
    description: event.content,
    dates: sortedDates,
    owner: event.author,
    event: event,
    id: event.tagAddress(),
  };
};

export const eventToDate = (event: NDKEvent): EventDate | null => {
  const start = event.tagValue("start");
  if (!start) return null;

  const includeTime = !Number.isNaN(Number(start));
  const date = new Date(includeTime ? Number(start) * 1000 : start);
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    date,
    includeTime,
    id: event.tagAddress(),
    event,
  };
};

/**
 * ユーザーが参加しているイベントの一覧を取得
 */
export const getJoinedCalendarEvents = async (ndk: NDK, pubkey: string) => {
  const rsvpEvents = await ndk.fetchEvents([
    {
      kinds: [CALENDAR_EVENT_RSVP_KIND as number],
      authors: [pubkey || ""],
    },
  ]);

  const dateEventATags = new Set<string>();
  for (const rev of rsvpEvents) {
    const aTag = rev.tagValue("a");
    if (aTag) {
      dateEventATags.add(aTag);
    }
  }

  const dateEvents = await ndk.fetchEvents([
    {
      kinds: [
        DRAFT_DATE_BASED_CALENDAR_EVENT_KIND,
        DRAFT_TIME_BASED_CALENDAR_EVENT_KIND,
      ] as number[],
      "#d": [...dateEventATags]
        .map((a) => a.split(":")?.[2] || "")
        .filter((t) => t),
    },
  ]);

  const calendarEventATags = new Set<string>();

  for (const ev of dateEvents) {
    const aTag = ev.tagValue("a");
    if (!aTag) {
      continue;
    }
    calendarEventATags.add(aTag);
  }

  const calendarEvents = await ndk.fetchEvents([
    {
      kinds: [DRAFT_CALENDAR_KIND as number],
      "#d": [...calendarEventATags]
        .map((aTag) => aTag.split(":")?.[2] || "")
        .filter((t) => t),
    },
  ]);

  const calendarDateATags = new Set<string>();
  for (const ev of calendarEvents) {
    const aTag = ev.tagValue("a");
    if (!aTag) {
      continue;
    }
    calendarDateATags.add(aTag);
  }

  const calendarDateEvents = await ndk.fetchEvents([
    {
      kinds: [
        DRAFT_DATE_BASED_CALENDAR_EVENT_KIND,
        DRAFT_TIME_BASED_CALENDAR_EVENT_KIND,
      ] as number[],
      "#d": [...calendarDateATags]
        .map((aTag) => aTag.split(":")?.[2] || "")
        .filter((t) => t),
      limit: 200,
    },
  ]);

  const dates = [...calendarDateEvents]
    .map((ev) => eventToDate(ev))
    .filter((d) => d !== null);

  return [...calendarEvents].map((ev) => eventToCalendar(ev, dates));
};
