export const formatDate = (date?: number | Date) => {
  const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  return dateTimeFormat.format(date);
};
