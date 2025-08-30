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

  async findWeeklyDetails(id: number) {
    return await prisma.weekly_report.findUnique({
      where: { id },
      include: {
        bridge_weekrep_weekdet: {
          include: {
            weekly_detail: true,
          },
        },
      },
    });
  }
}
