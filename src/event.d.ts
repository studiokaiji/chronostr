type EventDate = {
  date: Date;
  includeTime: boolean;
};

type EventInput = {
  title: string;
  description?: string;
  location?: string;
  geohash?: string;
  dates: EventDate[];
};
