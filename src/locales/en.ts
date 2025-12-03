export const en = {
  // Common
  common: {
    chronostr: "chronostr",
    tagline: "A scheduling adjustment and RSVP tool working on the Nostr.",
    submit: "Submit",
    save: "Save",
    create: "Create",
    cancel: "Cancel",
    gotIt: "Got it",
    noThanks: "No Thanks",
    connect: "Connect",
    disconnect: "Disconnect",
    edit: "Edit",
    copied: "Copied!",
    success: "Success!",
    error: "Error",
  },

  // Index page
  index: {
    createNewEvent: "Create New Event",
  },

  // MyPage
  mypage: {
    title: "My Page",
    joinedEvents: "Joined Events",
    pleaseConnect: "Please connect to NIP-07 client first.",
  },

  // Event page
  event: {
    rsvpFetchError: "RSVP Fetch Error",
    accountError: "Account Error",
    failedToSubmit: "Failed to Submit.",
  },

  // Header
  header: {
    login: "Login (NIP-07)",
  },

  // Event Editor
  eventEditor: {
    eventTitle: "Event title",
    eventTitlePlaceholder: "Ostrich sashimi party",
    description: "Description",
    descriptionPlaceholder: "Let's all go eat some delicious ostrich!",
    candidateDates: "Candidate dates",
    currentCandidateDates: "Current candidate dates",
    newCandidateDates: "New candidate dates",
    candidateDatesPlaceholder: `Enter candidate dates / times for events.
Candidates are separated by line breaks.

Examples:
2023-12-13
2023-12-13T16:00

You can also enter the date from the calendar.
`,
    invalidDate: "An invalid date was found.",
    invalidDateDescription: (date: string) =>
      `"${date}" is not in accordance with ISO8601.`,
    editEvent: "Edit Event",
    note1: "1. Creating an event requires signing with NIP-07.",
    note2:
      "2. A signature is not required to participate in the event, but if you do not sign, you will only be able to edit the content from the same PC / Smartphone and browser.",
  },

  // Join the event
  joinEvent: {
    connectToNostr: "Connect to Nostr Account?",
    connectDescription:
      "If you connect your Nostr account, your profile will be automatically filled in, and you will be able to make changes to your schedule and contact members from other browsers as well.",
    name: "Name",
    candidateDates: "Candidate dates",
    reSchedule: "Re Schedule",
    join: "Join",
  },

  // Contact
  contact: {
    title: "Contact",
    noParticipants: "No participants",
    noParticipantsDescription:
      "This event does not appear to have any participants yet.",
    replyingTo: (name: string) => `Replying to ${name}`,
    replyingToMultiple: (names: string[], lastName: string) =>
      `Replying to ${names.join(", ")} and ${lastName}`,
  },

  // NIP-07 connection
  nip07: {
    accountConnected: "Account Connected!",
    failedToConnect: "Failed to connect",
  },
} as const;
