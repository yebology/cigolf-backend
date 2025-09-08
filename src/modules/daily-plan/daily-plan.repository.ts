import { PrismaClient } from "@prisma/client";
import {
  calculateTaskStats,
  convertToISO,
  findForeman,
  formatDateRange,
  getDailyReport,
  isValidArea,
  mapTasksToDivisions,
  uploadImage,
} from "./daily-plan.helper";
import { Request } from "express";

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
        start_date: "desc",
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
      orderBy: {
        date: "desc",
      },
    });

    return formatDateRange(dailyReport);
  }

  async findFilteredAllDivisionDailyPlan(
    foremanId: number,
    startAt: string,
    endAt: string
  ) {
    const dailyReport = await prisma.daily_report.findMany({
      where: {
        foreman_id: foremanId,
        date: {
          gte: new Date(convertToISO(startAt)),
          lte: new Date(convertToISO(endAt)),
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return formatDateRange(dailyReport);
  }

  async newDivisionDailyPlan(foremanId: number, req: Request) {
    const { date, divisions } = req.body;

    const newDailyReport = await prisma.daily_report.create({
      data: {
        date: new Date(convertToISO(date)),
        foreman_id: foremanId,
        region_id: foremanId,
      },
    });

    for (const div of divisions) {
      for (const task of div.tasks) {
        if (task.priority <= 0 || task.priority >= 6) {
          throw new Error("prioritiy maks value is 5");
        }

        const newDailyDetail = await prisma.daily_detail.create({
          data: {
            division_id: div.divisionId,
            location_id: div.locationId,
            title_task: task.jobType,
            priority: ("P" + task!.priority!.toString()) as any,
            hole: task.area.join(", "),
            detail: task.description,
          },
        });

        await prisma.bridge_dailyrep_dailydet.create({
          data: {
            dailydet_id: newDailyDetail.id,
            dailyrep_id: newDailyReport.id,
          },
        });
      }
    }
  }

  async approveForemanTodayTasks(
    foremanId: number,
    taskId: number,
    spvId: number
  ) {
    const todayTasks = await prisma.daily_report.findUnique({
      where: {
        id: taskId,
        foreman_id: foremanId,
      },
    });

    if (!todayTasks) {
      throw new Error("The Task not found.");
    }

    if (todayTasks!.is_approved) {
      throw new Error("The Task already approved.");
    } else {
      await prisma.daily_report.update({
        where: {
          id: taskId,
          foreman_id: foremanId,
        },
        data: {
          is_approved: true,
          approved_by: spvId,
          approved_at: new Date().toISOString(),
        },
      });
    }
  }

  async addForemanTask(
    foremanId: number,
    taskId: number,
    divisionId: number,
    locationId: number,
    jobType: string,
    area: string[],
    priority: number,
    description: string,
    workerNeeded?: number,
    workerAvailable?: number,
    workerNameList?: string[]
  ) {
    if (priority <= 0 || priority >= 6) {
      throw new Error("maximum cant more than 5");
    }

    const newDailyReport = await prisma.daily_report.findUnique({
      where: {
        id: taskId,
        foreman_id: foremanId,
      },
    });

    if (newDailyReport?.is_approved) {
      throw new Error("Task already approved. Cannot add a new one.");
    }

    const newDailyDetail = await prisma.daily_detail.create({
      data: {
        division_id: divisionId,
        location_id: locationId,
        title_task: jobType,
        priority: ("P" + priority!.toString()) as any,
        hole: area.join(", "),
        detail: description,
        worker_need: workerNeeded || null,
        worker_avail: workerAvailable || null,
        worker_name: workerNameList?.join(", ") || null,
      },
    });

    await prisma.bridge_dailyrep_dailydet.create({
      data: {
        dailydet_id: newDailyDetail.id,
        dailyrep_id: newDailyReport!.id,
      },
    });
  }

  async updateForemanTask(
    foremanId: number,
    dailyReportId: number,
    taskId: number,
    locationId: number,
    area: string,
    workerNeeded: number,
    availableWorker: number,
    workerNameList: string,
    ImageAttachment?: Express.Multer.File
  ) {
    const jsonArea = JSON.parse(area);
    const jsonWorkerNameList = JSON.parse(workerNameList);

    if (!isValidArea(jsonArea)) {
      throw new Error("invalid area value");
    }

    if (!ImageAttachment) {
      throw new Error("image not included!");
    }

    const imageUrl = await uploadImage(ImageAttachment);

    const dailyReport = await prisma.daily_report.findFirst({
      where: {
        foreman_id: foremanId,
        id: dailyReportId,
      },
    });

    const bridgeDaily = await prisma.bridge_dailyrep_dailydet.findFirst({
      where: {
        dailydet_id: taskId,
        dailyrep_id: dailyReport!.id,
      },
    });

    if (!bridgeDaily) {
      throw Error("invalid task");
    }

    await prisma.daily_detail.update({
      where: {
        id: taskId,
      },
      data: {
        location_id: Number(locationId), // pastikan Int
        hole: JSON.stringify(jsonArea), // simpan array ke JSON
        worker_need: Number(workerNeeded), // pastikan Int
        worker_avail: Number(availableWorker), // pastikan Int
        worker_name: jsonWorkerNameList.join(", "), // string biasa
        url_photo: imageUrl, // dari Supabase
      },
    });
  }

  //   async findAll() {
  //     return await prisma.daily_report.findMany({
  //       orderBy : { date: "desc" },
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
