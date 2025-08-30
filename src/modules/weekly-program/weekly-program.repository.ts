import { PrismaClient } from "@prisma/client";

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

  // async findDetail(id: number) {
  //   return await prisma.bridge_weekrep_weekdet.findUnique({
  //     where: {
  //       id: id,
  //     },
  //     include: {
  //       weekly_report: true,
  //       weekly_detail: {
  //         include: {
  //           location: {
  //             include: {
  //               title_task: true
  //             },
  //           },
  //           division: true,
  //         },
  //       },
  //     },
  //   });
  // }

  async findWeeklyReport(id: number) {
    return await prisma.weekly_report.findFirst({
      where: {
        id: id,
      },
    });
  }

  async findWeeklyDetail(id: number) {
    return await prisma.weekly_detail.findMany({
      where: {
        id: id,
      },
    });
  }

  async findWeeklyDetails(id: number) {
    const detailList = await prisma.bridge_weekrep_weekdet.findMany({
      where: {
        weekrep_id: id,
      },
    });
    const detail = [];

    for (const item of detailList) {
      const detailData = await this.findWeeklyDetail(item.weekdet_id ?? 0);
      if (detailData) {
        detail.push(...detailData);
      }
    }
    return detail;
  }
}
