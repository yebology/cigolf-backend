import { WeeklyPlanRepository } from "./weekly-plan.repository";

const repo = new WeeklyPlanRepository();

export class WeeklyPlanService {
  async getWeeklyPlanHistories() {
    const result = await repo.findAll();
    return result;
  }

  async getFilteredWeeklyPlanHistories(startAt: string, endAt: string) {
    const result = await repo.findByDateRange(startAt, endAt);

    if (!result || result.length === 0) {
      throw new Error("invalid params");
    }

    return result;
  }

  async getWeeklyPlanDetails(id: string) {
    const result = await repo.findWeeklyDetails(Number(id));

    if (!result) {
      throw new Error("The requested resource was not found.");
    }

    return result;
  }

  async createWeeklyPlan(data: any) {
    await repo.createWeeklyPlan(data);
  }

  async exportFile(weeklyIds: number[], type: string) {
    return await repo.exportFile(weeklyIds, type);
  }
}
