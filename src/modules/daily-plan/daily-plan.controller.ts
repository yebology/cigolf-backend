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

export const getDivisionDailyTaskPlanByDay = async (
  req: Request,
  res: Response
) => {
  try {
    const { foreman_id } = req.params;
    const result = await service.divisionDailyTaskPlanByDay(Number(foreman_id));
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

export const getAllDivisionDailyPlan = async (req: Request, res: Response) => {
  try {
    const { foreman_id } = req.params;
    const { start_at, end_at } = req.query;

    let result;
    if (start_at && end_at) {
      result = await service.filteredAllDivisionDailyPlan(
        Number(foreman_id),
        start_at.toString(),
        end_at.toString()
      );
    } else if (!start_at && !end_at) {
      result = await service.allDivisionDailyPlan(Number(foreman_id));
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "invalid params" });
    }

    return res.json({
      status: "success",
      message: "retrieve all of the last 7 day plans",
      data: result,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ status: "error", message: (error as Error).message });
  }
};
