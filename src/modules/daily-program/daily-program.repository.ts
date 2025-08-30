import { da } from "@faker-js/faker";
import { PrismaClient, priority } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

export class DailyPlanRepository {
    async findAll() {
        return await prisma.daily_report.findMany({
            orderBy: { date: "desc" }
        });
    }

    async findDailyReportsByRegionId(region_id: number) {
        return prisma.daily_report.findMany({
            where: {
                region_id
            },
            orderBy: { date: "desc" }
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