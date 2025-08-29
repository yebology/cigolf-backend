import { WeeklyPlanRepository } from "./weekly-program.repository";

const repo = new WeeklyPlanRepository();

export class WeeklyPlanService {
  async getWeeklyPlanHistories() {
    const histories = await repo.findAll();
    return histories;
  }

  async getFilteredWeeklyPlanHistories() {}
}
