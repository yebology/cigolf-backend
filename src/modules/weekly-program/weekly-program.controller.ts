import { Response, Request } from "express";
import { WeeklyPlanService } from "./weekly-program.service";
import { filterWeeklyPlanAttributes } from "./weekly-program.helper";

const service = new WeeklyPlanService();

export const getWeeklyPlanHistories = async (req: Request, res: Response) => {
  try {
    const { start_at, end_at } = req.query;
    let result;
    if (start_at && end_at) {
      result = await service.getFilteredWeeklyPlanHistories(
        start_at.toString(),
        end_at.toString()
      );
    } else {
      result = await service.getWeeklyPlanHistories();
    }
    res.json({
      status: "success",
      message: "Weekly plan fetch successfuly.",
      data: filterWeeklyPlanAttributes(result),
    });
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getWeeklyPlanDetail = async (req: Request, res: Response) => {
  try {
    const { WEEKLY_ID } = req.params;

    if (WEEKLY_ID) {
      const result = await service.getWeeklyPlanDetail(WEEKLY_ID);
      res.json({
        status: "success",
        message: "Weekly plan fetch successfuly.",
      });
    }
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: (error as Error).message });
  }
};
