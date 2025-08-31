import { PrismaClient, type weekly_report } from "@prisma/client";
import { parse, addDays } from "date-fns";

const prisma = new PrismaClient();

export const parseDate = (input: string) => {
  const [day, month, year] = input.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const convertToISO = (dateStr: string) => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
}

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

export const getWeeklyReportWithDetails = async (id: number) => {
  return await prisma.weekly_report.findUnique({
    where: { id },
    include: {
      bridge_weekrep_weekdet: {
        include: {
          weekly_detail: {
            include: {
              division: true,
              location: true,
            },
          },
        },
      },
    },
  });
};

export const extractTasks = (report: any) => {
  return report.bridge_weekrep_weekdet.map((b: any) => b.weekly_detail);
};

export const groupTasksByDivisionAndLocation = (tasks: any[]) => {
  const divisionsMap = new Map();

  for (const task of tasks) {
    const divId = task!.division.id;
    const locId = task!.location.id;

    if (!divisionsMap.has(divId)) {
      divisionsMap.set(divId, {
        id: task!.division.id,
        name: task!.division.division,
        locations: new Map(),
      });
    }

    const division = divisionsMap.get(divId);

    if (!division.locations.has(locId)) {
      division.locations.set(locId, {
        locationId: task!.location.id,
        location: task!.location.location,
        tasks: [],
      });
    }

    const location = division.locations.get(locId);

    location.tasks.push({
      id: task!.id,
      taskType: task!.title_task,
      day: task!.start_date
        ? task!.start_date.toISOString().slice(0, 10)
        : null,
      description: task!.detail,
      area: task!.hole ? task!.hole.split(",").map((h: any) => h.trim()) : [],
    });
  }

  return Array.from(divisionsMap.values()).map((div) => ({
    ...div,
    locations: Array.from(div.locations.values()),
  }));
};

export const formatWeeklyReport = (report: any, divisions: any[]) => {
  return {
    id: report.id,
    startAt: report.start_date.toISOString().split("T")[0],
    endAt: report.end_date.toISOString().split("T")[0],
    createAt: report.created_at!.toISOString().split("T")[0],
    divisions,
  };
};
