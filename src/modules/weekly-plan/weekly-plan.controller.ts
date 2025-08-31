import { Response, Request } from "express";
import { WeeklyPlanService } from "./weekly-plan.service";
import { filterWeeklyPlanAttributes } from "./weekly-plan.helper";

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
      .status(422)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getWeeklyPlanDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await service.getWeeklyPlanDetails(id);

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

export const createWeeklyPlan = async (req: Request, res: Response) => {
  try {
    await service.createWeeklyPlan(req.body);

    res.json({
      status: "success",
      message: "Weekly plan successfully created",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: (error as Error).message,
      errors: [
        {
          day: ["day must be in english"],
        },
      ],
    });
  }
};

export const exportFile = async (req: Request, res: Response) => {
  try {
    const { type, weekly_ids } = req.query;
    // const result =
  } catch (error) {}
};
