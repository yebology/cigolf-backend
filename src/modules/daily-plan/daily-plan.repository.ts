import { PrismaClient } from "@prisma/client";
import {
  calculateTaskStats,
  findForeman,
  formatDateRange,
  getDailyReport,
  mapTasksToDivisions,
} from "./daily-plan.helper";

const prisma = new PrismaClient();

export class DailyPlanRepository {
  async findDailyTaskPlan(foremanId: number, taskId: number) {
    const foreman = await findForeman(foremanId);
    const report = await getDailyReport(foremanId, taskId);

    if (!report) return null;

    const tasks = report.bridge_dailyrep_dailydet.map((b) => b.daily_detail);
    const divisions = mapTasksToDivisions(tasks);

    return {
      id: taskId,
      createdAt: report.created_at?.toISOString().split("T")[0],
      approved: {
        isApproved: report.is_approved,
        approvedAt: report.approved_at
          ? report.approved_at.toISOString().split("T")[0]
          : "",
        spvName: report.users?.name || "",
      },
      foremanName: foreman?.users.name,
      divisions,
    };
  }

  async findDivisionDailyTaskPlanByDay(foremanId: number) {
    const foreman = await findForeman(foremanId);
    const report = await getDailyReport(foremanId);

    if (!report) return null;

    const tasks = report.bridge_dailyrep_dailydet.map((b) => b.daily_detail);
    const divisions = mapTasksToDivisions(tasks);
    const { totalTasks, finishedTasks, pendingTasks } =
      calculateTaskStats(divisions);

    return {
      id: report.id,
      createdAt: report.created_at?.toISOString().split("T")[0],
      approved: {
        isApproved: report.is_approved,
        approvedAt: report.approved_at
          ? report.approved_at.toISOString().split("T")[0]
          : "",
        spvName: report.users?.name || "",
      },
      outsourceCompany: foreman?.company,
      foremanName: foreman?.users.name,
      TotalTasks: totalTasks,
      finishedTasks,
      pendingTasks,
      divisions,
    };
  }

  async findAllDivisionDailyPlan(foremanId: number) {
    const weeklyDailyReport = await prisma.weekly_report.findFirst({
      orderBy: {
        id: "desc",
      },
      take: 1,
    });

    const startDate = weeklyDailyReport?.start_date;
    const endDate = weeklyDailyReport?.end_date;

    const dailyReport = await prisma.daily_report.findMany({
      where: {
        foreman_id: foremanId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return formatDateRange(dailyReport);
  }

  //   async findAll() {
  //     return await prisma.daily_report.findMany({
  //       orderBy: { date: "desc" },
  //     });
  //   }

  //   async findDailyReportsByRegionId(region_id: number) {
  //     return prisma.daily_report.findMany({
  //       where: {
  //         region_id,
  //       },
  //       orderBy: { date: "desc" },
  //     });
  //   }

  //   async findByDateRange(start_at: string, end_at: string) {
  //     return await prisma.daily_report.findMany({
  //       where: {
  //         date: {
  //           gte: new Date(start_at),
  //           lte: new Date(end_at),
  //         },
  //       },
  //     });
  //   }

  //   async findDailyDetails(id: number) {
  //     const report = await prisma.daily_report.findUnique({
  //       where: { id },
  //       include: {
  //         bridge_dailyrep_dailydet: {
  //           include: {
  //             daily_detail: true,
  //           },
  //         },
  //         foreman: {
  //           include: {
  //             users: true,
  //           },
  //         },
  //         region: true,
  //       },
  //     });

  //     if (!report) return null;

  //     const details = report.bridge_dailyrep_dailydet.map((b) => b.daily_detail);

  //     return {
  //       id: report.id,
  //       date: report.date.toLocaleDateString("id-ID"),
  //       foreman: report.foreman.users.name ?? null,
  //       region: report.region.region ?? null,
  //       details,
  //     };
  //   }

  //   async findWeeklyDetailWithSameDate(date: Date) {
  //     return await prisma.weekly_detail.findMany({
  //       where: {
  //         start_date: {
  //           gte: startOfDay(date),
  //           lte: endOfDay(date),
  //         },
  //       },
  //     });
  //   }
}
