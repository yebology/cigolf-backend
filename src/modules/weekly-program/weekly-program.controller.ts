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
      console.log(result);
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
    console.log(id);

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

export async function createWeeklyPlan(req: Request, res: Response) {
  try {
    const result = await service.createWeeklyPlan(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
