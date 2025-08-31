import { PrismaClient } from "@prisma/client";
import {
  convertToISO,
  extractTasks,
  formatDateFromDay,
  formatWeeklyReport,
  getWeeklyReportWithDetails,
  groupTasksByDivisionAndLocation,
  parseDate,
} from "./weekly-plan.helper";

const prisma = new PrismaClient();

export class WeeklyPlanRepository {
  async findAll() {
    return await prisma.weekly_report.findMany();
  }

  async findByDateRange(startAt: string, endAt: string) {
    return await prisma.weekly_report.findMany({
      where: {
        start_date: {
          gte: new Date(convertToISO(startAt)),
        },
        end_date: {
          lte: new Date(convertToISO(endAt)),
        },
      },
    });
  }

  async findWeeklyReport(id: number) {
    return await prisma.weekly_report.findFirst({
      where: {
        id: id,
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
    try {
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
                start_date: formatDateFromDay(
                  data.startAt,
                  data.endAt,
                  task.day
                ),
                division_id: div.id,
                detail: task.description,
                hole: task.Area.join(", "),
              },
            });

            // const dailyReport = await prisma.daily_report.create({
            //   data: {

            //   }
            // })

            await prisma.bridge_weekrep_weekdet.create({
              data: {
                weekdet_id: weeklyDetail.id,
                weekrep_id: weeklyReport.id,
              },
            });
          }
        }
      }
      return { success: true };
    } catch (_) {
      return { success: false };
    }
  }
}
