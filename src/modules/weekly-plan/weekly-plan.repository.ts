import { PrismaClient } from "@prisma/client";
import {
  convertToISO,
  extractTasks,
  formatDateFromDay,
  formatWeeklyReport,
  getWeeklyReportWithDetails,
  groupTasksByDivisionAndLocation,
  isValidDay,
  parseDate,
} from "./weekly-plan.helper";

const prisma = new PrismaClient();

export class WeeklyPlanRepository {
  async findAll() {
    return await prisma.weekly_report.findMany({
      orderBy: {
        start_date: "desc",
      },
    });
  }

  async findByDateRange(startAt: string, endAt: string) {
    // Parse dates directly from YYYY-MM-DD format
    const startDate = new Date(startAt + "T00:00:00.000Z");
    const endDate = new Date(endAt + "T23:59:59.999Z");

    // Validate dates before querying
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format provided");
    }

    return await prisma.weekly_report.findMany({
      where: {
        start_date: {
          gte: startDate,
        },
        end_date: {
          lte: endDate,
        },
      },
      orderBy: {
        start_date: "asc",
      },
    });
  }

  async findWeeklyReport(id: number) {
    return await prisma.weekly_report.findFirst({
      where: {
        id: id,
      },
      orderBy: {
        start_date: "desc",
      },
    });
  }

  async findWeeklyDetails(id: number) {
    const report = await getWeeklyReportWithDetails(id);
    if (!report) return null;

    const tasks = extractTasks(report);
    const divisions = groupTasksByDivisionAndLocation(tasks);

    return formatWeeklyReport(report, divisions);
  }

  async createWeeklyPlan(data: any) {
    const hasInvalidDay = data.divisions.some((div: any) =>
      div.locations.some((loc: any) =>
        loc.tasks.some((task: any) => {
          if (!task.day) return false;
          return !isValidDay(task.day);
        })
      )
    );

    if (hasInvalidDay) {
      throw new Error("day must be in english");
    }

    const weeklyReport = await prisma.weekly_report.create({
      data: {
        start_date: parseDate(data.startAt),
        end_date: parseDate(data.endAt),
      },
    });

    for (const div of data.divisions) {
      for (const loc of div.locations) {
        for (const task of loc.tasks) {
          const weeklyDetail = await prisma.weekly_detail.create({
            data: {
              title_task: task.taskType,
              location_id: loc.locationId,
              start_date: formatDateFromDay(data.startAt, data.endAt, task.day),
              division_id: div.id,
              detail: task.description,
              hole: task.Area.join(", "),
            },
          });

          await prisma.bridge_weekrep_weekdet.create({
            data: {
              weekdet_id: weeklyDetail.id,
              weekrep_id: weeklyReport.id,
            },
          });
        }
      }
    }
  }
}
