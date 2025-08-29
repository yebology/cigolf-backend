import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class WeeklyPlanRepository {
  async findAll() {
    return await prisma.laporan_mingguan.findMany({
      orderBy: {
        created_at: "asc",
      },
    });
  }
}
