import { Request } from "express";
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

    return result;
  }

  async newDivisionDailyPlan(foremanId: number, req: Request) {
    await repo.newDivisionDailyPlan(foremanId, req);
  }

  async approveForemanTodayTasks(
    foremanId: number,
    taskId: number,
    spvId: number
  ) {
    await repo.approveForemanTodayTasks(foremanId, taskId, spvId);
  }

  async addForemanTask(
    foremanId: number,
    taskId: number,
    divisionId: number,
    locationId: number,
    jobType: string,
    area: string[],
    priority: number,
    description: string,
    workerNeeded?: number,
    workerAvailable?: number,
    workerNameList?: string[]
  ) {
    await repo.addForemanTask(
      foremanId,
      taskId,
      divisionId,
      locationId,
      jobType,
      area,
      priority,
      description,
      workerNeeded,
      workerAvailable,
      workerNameList
    );
  }

  async updateForemanTask(
    foremanId: number,
    dailyReportId: number,
    taskId: number,
    locationId: number,
    area: string,
    workerNeeded: number,
    availableWorker: number,
    workerNameList: string,
    ImageAttachment?: Express.Multer.File
  ) {
    await repo.updateForemanTask(
      foremanId,
      dailyReportId,
      taskId,
      locationId,
      area,
      workerNeeded,
      availableWorker,
      workerNameList,
      ImageAttachment
    );
  }

  async exportFile(foremanId: number, dailyIds: number[]) {
    const result = await repo.exportFile(foremanId, dailyIds);

    return result;
  }
}
