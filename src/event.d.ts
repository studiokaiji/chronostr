type EventDate = {
  date: Date;
  includeTime: boolean;
};

type EventInput = {
  title: string;
  description?: string;
  dates: EventDate[];
};
