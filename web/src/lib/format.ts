const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});
const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
});

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatWeekday(value: string): string {
  return weekdayFormatter.format(new Date(value));
}

export function toDateTimeInput(value: string): string {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}
