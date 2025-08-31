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

    if (!result) {
      throw new Error("Foreman not found");
    }

    return result;
  }

  async allDivisionDailyPlan(foremanId: number) {
    const result = await repo.findAllDivisionDailyPlan(foremanId);
    return result;
  }

  async filteredAllDivisionDailyPlan(
    foremanId: number,
    startAt: string,
    endAt: string
  ) {
    const result = await repo.findFilteredAllDivisionDailyPlan(
      foremanId,
      startAt,
      endAt
    );

    if (!result || result.length === 0) {
      throw new Error("invalid params");
    }
    
    return result;
  }
}
