import { WeeklyPlanRepository } from "./weekly-program.repository";

const repo = new WeeklyPlanRepository();

export class WeeklyPlanService {
  async getWeeklyPlanHistories() {
    const histories = await repo.findAll();
    return histories;
  }

  async getFilteredWeeklyPlanHistories(start_at: string, end_at: string) {
    const histories = await repo.findByDateRange(start_at, end_at);

    if (!histories || histories.length === 0) {
      throw new Error("invalid params");
    }

    return histories;
  }

  // async getWeeklyPlanDetail(id: string) {
  //   const detail = await repo.findDetail(Number(id));
  //   console.log(detail);

  //   if (!detail) {
  //     throw new Error("The requested resource was not found.");
  //   }

  //   return detail;
  // }
}
