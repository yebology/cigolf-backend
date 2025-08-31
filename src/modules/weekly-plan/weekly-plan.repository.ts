import { PrismaClient } from "@prisma/client";
import { formatDateFromDay, parseDate } from "./weekly-plan.helper";

const prisma = new PrismaClient();

export class WeeklyPlanRepository {
  async findAll() {
    return await prisma.weekly_report.findMany();
  }

  async findByDateRange(start_at: string, end_at: string) {
    return await prisma.weekly_report.findMany({
      where: {
        start_date: {
          gte: new Date(start_at),
        },
        end_date: {
          lte: new Date(end_at),
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
    const report = await prisma.weekly_report.findUnique({
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

    if (!report) return null;

    const tasks = report.bridge_weekrep_weekdet.map((b) => b.weekly_detail);

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
        area: task!.hole ? task!.hole.split(",").map((h) => h.trim()) : [],
      });
    }

    const divisions = Array.from(divisionsMap.values()).map((div) => ({
      ...div,
      locations: Array.from(div.locations.values()),
    }));

    return {
      id: report.id,
      startAt: report.start_date.toISOString().split("T")[0],
      endAt: report.end_date.toISOString().split("T")[0],
      createAt: report.created_at!.toISOString().split("T")[0],
      divisions,
    };
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
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }
}
