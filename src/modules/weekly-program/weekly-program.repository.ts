import { PrismaClient, priority } from "@prisma/client";

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
    const report = await prisma.weekly_report.findUnique({
      where: { id },
      include: {
        bridge_weekrep_weekdet: {
          include: {
            weekly_detail: true,
          },
        },
      },
    });

    if (!report) return null;

    const details = report.bridge_weekrep_weekdet.map((b) => b.weekly_detail);

    return {
      id: report.id,
      start_date: report.start_date,
      end_date: report.end_date,
      details,
    };
  }

  async createWeeklyPlan(data: {
    start_date: string;
    end_date: string;
    details: {
      title_task: string;
      location_id: number;
      division_id: number;
      priority: string;
      start_date?: string;
      hole?: string;
      detail?: string;
      is_done?: boolean | null;
    }[];
  }) {
    // return prisma.weekly_report.create({
    //   data: {
    //     start_date: new Date(data.start_date),
    //     end_date: new Date(data.end_date),
    //     bridge_weekrep_weekdet: {
    //       create: data.details.map((d) => {
    //         const startDate = d.start_date ? new Date(d.start_date) : null;
    //         let isDone: boolean | null = null;
    //         if (startDate !== null) {
    //           isDone = d.is_done ?? false;
    //         }

    //         return {
    //           weekly_detail: {
    //             create: {
    //               title_task: d.title_task,
    //               location_id: d.location_id,
    //               division_id: d.division_id,
    //               priority: d.priority as priority,
    //               start_date: startDate,
    //               hole: d.hole ?? null,
    //               detail: d.detail,
    //               is_done: isDone,
    //             },
    //           },
    //         };
    //       })
    //     },
    //   },
    //   include: {
    //     bridge_weekrep_weekdet: { include: { weekly_detail: true } },
    //   },
    // });

    await prisma.weekly_report.create({
      data: {
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        bridge_weekrep_weekdet: {
          create: data.details.map((d) => {
            const startDate = d.start_date ? new Date(d.start_date) : null;
            let isDone: boolean | null = null;
            if (startDate !== null) {
              isDone = d.is_done ?? false;
            }

            return {
              weekly_detail: {
                create: {
                  title_task: d.title_task,
                  location_id: d.location_id,
                  division_id: d.division_id,
                  priority: d.priority as priority,
                  start_date: startDate,
                  hole: d.hole ?? null,
                  detail: d.detail,
                  is_done: isDone,
                },
              },
            };
          })
        },
      },
    });

    return { message: "New weekly report has been created successfully." };
  }
}
