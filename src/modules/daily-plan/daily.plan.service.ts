import { DailyPlanRepository } from "./daily-plan.repository";

const repo = new DailyPlanRepository();

export class DailyPlanService {
  async dailyTaskPlan(foremanId: number, taskId: number) {
    const result = await repo.findDailyTaskPlan(foremanId, taskId);

    if (!result) {
      throw new Error("Foreman not found");
    }

    return result;
  }

  async divisionDailyTaskPlanByDay(foremanId: number) {
    const result = await repo.findDivisionDailyTaskPlanByDay(foremanId);

    return result;
  }
}
