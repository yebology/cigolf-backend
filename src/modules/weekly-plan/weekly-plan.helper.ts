import type { weekly_report } from "@prisma/client";
import { parse, addDays, format } from "date-fns";

export const parseDate = (input: string) => {
  const [day, month, year] = input.split("-").map(Number);
  return new Date(year, month - 1, day);
};
export const filterWeeklyPlanAttributes = (histories: weekly_report[]) => {
  return histories.map((history: weekly_report) => ({
    id: history.id,
    startAt: new Date(history.start_date).toISOString().split("T")[0],
    endAt: new Date(history.end_date).toISOString().split("T")[0],
  }));
};

export const formatDateFromDay = (
  startAt: string,
  endAt: string,
  day: string
) => {
  const daysMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const start = parse(startAt, "dd-MM-yyyy", new Date());
  const end = parse(endAt, "dd-MM-yyyy", new Date());

  let targetDay = daysMap[day.toLowerCase()];
  if (targetDay == undefined) {
    throw new Error("");
  }

  for (let i = 0; i < 7; i++) {
    let candidate = addDays(start, i);
    if (candidate.getDay() === targetDay && candidate <= end) {
      return candidate;
    }
  }

  return;
};
