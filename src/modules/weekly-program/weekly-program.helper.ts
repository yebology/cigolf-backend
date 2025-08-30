import type { weekly_report } from "@prisma/client";

export const filterWeeklyPlanAttributes = (histories: weekly_report[]) => {
  return histories.map((history: weekly_report) => ({
    id: history.id,
    startAt: new Date(history.start_date).toISOString().split("T")[0],
    endAt: new Date(history.end_date).toISOString().split("T")[0],
  }));
};
