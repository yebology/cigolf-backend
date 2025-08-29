import { Response } from "express";
import { WeeklyPlanService } from "./weekly-program.service";

const service = new WeeklyPlanService();

export const getWeeklyPlanHistories = async (res: Response) => {
  try {
    const result = await service.getWeeklyPlanHistories();
    res.json({
      status: "success",
      message: "Weekly plan fetch successfuly.",
      data: result,
    });
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getFilteredWeeklyPlanHistories = async (res: Response) => {
  try {
    const result = await service.getFilteredWeeklyPlanHistories();
    res.json({
      status: "success",
      message: "Weekly plan fetch successfuly.",
      data: result,
    });
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: (error as Error).message });
  }
};
