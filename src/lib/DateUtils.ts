export type DayDate = {
  year: number;
  month: number;
  day: number;
};

function padSecondDigit(value: number) {
  if (value < 10) return `0${value}`;
  return value.toString();
}

export function dayDateToIsoString(dayDate: DayDate) {
  return `${dayDate.year}-${padSecondDigit(dayDate.month)}-${padSecondDigit(dayDate.day)}T00:00:00.000Z`;
}
