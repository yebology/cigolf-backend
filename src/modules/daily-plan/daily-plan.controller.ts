import { Request, Response } from "express";
import { DailyPlanService } from "./daily.plan.service";

const service = new DailyPlanService();

export const getDailyTaskPlan = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const result = await service.dailyTaskPlan(
      Number(foreman_id),
      Number(task_id)
    );
    res.json({
      status: "success",
      message: "Fetch data success.",
      data: result,
    });
  } catch (error) {
    res
      .status(404)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getDivisionDailyTaskPlanByDay = async (req: Request, res: Response) => {
    try {
        const { foreman_id } = req.params
        const result = await service.divisionDailyTaskPlanByDay(Number(foreman_id))

    } catch (error) {
        
    }
}