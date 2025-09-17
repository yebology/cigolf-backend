import { PrismaClient } from "@prisma/client";
import {
  calculateTaskStats,
  convertToISO,
  findForeman,
  formatDateRange,
  formatDateUTC7,
  getDailyReport,
  isValidArea,
  mapTasksToDivisions,
  uploadImage,
} from "./daily-plan.helper";
import { Request } from "express";
import { sendNotification } from "../../utils/notification/onesignal";


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
      createdAt: report.date?.toISOString().split("T")[0],
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

  async exportFile(foremanId: number, dailyIds: number[]) {
    if (dailyIds.length == 0) {
      throw new Error("");
    }

    let allReports: any[] = [];

    for (const id of dailyIds) {
      const foreman = await findForeman(foremanId);
      const report = await getDailyReport(foremanId, id);

      if (report) {
        const tasks = report!.bridge_dailyrep_dailydet.map(
          (b) => b.daily_detail
        );
        const divisions = mapTasksToDivisions(tasks);

        allReports.push({
          id: id,
          date: formatDateUTC7(report!.date.toISOString().split("T")[0]),
          createdAt: formatDateUTC7(
            report!.created_at!.toISOString().split("T")[0]
          ),
          approved: {
            isApproved: report!.is_approved,
            approvedAt: report!.approved_at
              ? formatDateUTC7(report!.approved_at.toISOString().split("T")[0])
              : "",
            spvName: report!.users?.name || "",
          },
          outsourceCompany: foreman?.company,
          foremanName: foreman?.users.name,
          divisions,
        });
      }
    }

    return allReports;
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
      createdAt: report.date?.toISOString().split("T")[0],
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
    const now = new Date();

    const utc7Offset = 7 * 60; // dalam menit
    const localNow = new Date(now.getTime() + utc7Offset * 60 * 1000);

    const startOfToday = new Date(
      Date.UTC(
        localNow.getUTCFullYear(),
        localNow.getUTCMonth(),
        localNow.getUTCDate()
      )
    );
    const endOfToday = new Date(
      startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1
    );

    const sevenDaysAgo = new Date(
      startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000
    );

    const dailyReport = await prisma.daily_report.findMany({
      where: {
        foreman_id: foremanId,
        date: {
          gte: sevenDaysAgo,
          lte: endOfToday,
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

    const foreman = await findForeman(foremanId);
    
    await sendNotification({
        title: "Laporan Harian Baru Telah Dibuat Untuk Anda",
        message: `Laporan harian pada tanggal ${newDailyReport.date.toISOString().split("T")[0]} telah dibuat.`,
        externalIds: [`User-${foreman?.user_id}`]
      });
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

      const foreman = await findForeman(foremanId);
      const spv = await prisma.user.findUnique({
        where: { id: spvId },
      });

      await sendNotification({
        title: "Laporan Harian Disetujui",
        message: `Laporan harian anda telah disetujui oleh ${spv?.name.split(" ")[0]}.`,
        externalIds: [`User-${foreman?.user_id}`]
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

    const foreman = await findForeman(foremanId);
    const division = await prisma.division.findUnique({
      where: { id: divisionId },
    });

    await sendNotification({
        title: "Tugas Baru Ditambahkan Untuk Anda",
        message: `${division?.division} task: ${jobType}.`,
        subtitle: `${description}`,
        externalIds: [`User-${foreman?.user_id}`]
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
    jobType: string,
    description: string,
    ImageAttachment?: Express.Multer.File
  ) {
    const jsonArea = JSON.parse(area);
    const jsonWorkerNameList = JSON.parse(workerNameList);

    if (!isValidArea(jsonArea)) {
      throw new Error("invalid area value");
    }

    var imageUrl = null;
    if (ImageAttachment) {
      imageUrl = await uploadImage(ImageAttachment);
    }

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
        location_id: Number(locationId),
        hole: Array.isArray(jsonArea)
          ? jsonArea.join(", ")
          : String(jsonArea ?? ""),
        worker_need: Number(workerNeeded),
        title_task: jobType,
        detail: description,
        worker_avail: Number(availableWorker),
        worker_name: jsonWorkerNameList.join(", "),
        url_photo: imageUrl,
        is_done: true,
      },
    });

    const foreman = await findForeman(foremanId);
    const user = await prisma.user.findUnique({
        where: { id: foreman?.user_id },
      });
    await sendNotification({
        title: `${user?.name.split(" ")[0]} Telah Memperbarui Tugas Harian`,
        message: `${jobType} telah diperbarui.`,
        tags: [{ 
          key: "role",relation: "=", value: "Supervisor" 
        },{ 
          key: "role",relation: "=", value: "Admin" 
        }
        ]
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
