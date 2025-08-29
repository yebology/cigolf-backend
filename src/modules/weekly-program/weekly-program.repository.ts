import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class WeeklyPlanRepository {
  async findAll() {
    return await prisma.laporan_mingguan.findMany();
  }

  async findByDateRange(start_at: string, end_at: string) {
    return await prisma.laporan_mingguan.findMany({
      where: {
        created_at: {
          gte: new Date(start_at),
          lte: new Date(end_at),
        },
      },
    });
  }
    
    async findDetail(id: number) {
        return await prisma.laporan_mingguan.findFirst({
            where: {
                id: id
            }
        })
    }
}
