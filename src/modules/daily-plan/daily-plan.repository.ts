import { PrismaClient } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

export class DailyPlanRepository {
  async findDailyTaskPlan(foremanId: number, taskId: number) {
    const foreman = await prisma.foreman.findFirst({
      where: {
        id: foremanId,
      },
      include: {
        users: true,
      },
    });

    const report = await prisma.daily_report.findUnique({
      where: {
        id: taskId,
      },
      include: {
        bridge_dailyrep_dailydet: {
          include: {
            daily_detail: {
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

    const tasks = report.bridge_dailyrep_dailydet.map((b) => b.daily_detail);

    const divisionsMap = new Map();

    for (const task of tasks) {
      const divId = task?.division_id;
      const locId = task?.location_id;

      if (!divisionsMap.has(divId)) {
        divisionsMap.set(divId, {
          id: divId,
          name: task?.division.division,
          locations: new Map(),
        });
      }

      const division = divisionsMap.get(divId);

      if (!division.locations.has(locId)) {
        division.locations.set(locId, {
          locationId: locId,
          locationName: task?.location.location,
          tasks: [],
        });
      }

      const location = division.locations.get(locId);

      location.tasks.push({
        id: task?.id,
        taskType: task?.title_task,
        description: task?.detail,
        area: task?.hole ? task?.hole.split(",").map((h) => h.trim()) : [],
        needWorker: task?.worker_need,
        availableWorker: task?.worker_avail,
        workerList: task?.worker_name
          ? task.worker_name.split(",").map((h) => h.trim())
          : [],
        isFinished: task?.is_done,
        imageUrl: task?.url_photo,
      });
    }

    const divisions = Array.from(divisionsMap.values()).map((div) => ({
      ...div,
      locations: Array.from(div.locations.values()),
    }));

    return {
      id: taskId,
      createdAt: report.created_at?.toISOString().split("T")[0],
      foremanName: foreman?.users.name,
      divisions,
    };
  }

    async findDivisionDailyTaskPlanByDay(foremanId: number) {
    //   const foreman
  }

  async findAll() {
    return await prisma.daily_report.findMany({
      orderBy: { date: "desc" },
    });
  }

  async findDailyReportsByRegionId(region_id: number) {
    return prisma.daily_report.findMany({
      where: {
        region_id,
      },
      orderBy: { date: "desc" },
    });
  }

  async findByDateRange(start_at: string, end_at: string) {
    return await prisma.daily_report.findMany({
      where: {
        date: {
          gte: new Date(start_at),
          lte: new Date(end_at),
        },
      },
    });
  }

  async findDailyDetails(id: number) {
    const report = await prisma.daily_report.findUnique({
      where: { id },
      include: {
        bridge_dailyrep_dailydet: {
          include: {
            daily_detail: true,
          },
        },
        foreman: {
          include: {
            users: true,
          },
        },
        region: true,
      },
    });

    if (!report) return null;

    const details = report.bridge_dailyrep_dailydet.map((b) => b.daily_detail);

    return {
      id: report.id,
      date: report.date.toLocaleDateString("id-ID"),
      foreman: report.foreman.users.name ?? null,
      region: report.region.region ?? null,
      details,
    };
  }

  async findWeeklyDetailWithSameDate(date: Date) {
    return await prisma.weekly_detail.findMany({
      where: {
        start_date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });
  }
}
