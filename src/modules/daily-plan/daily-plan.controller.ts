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

export const createNewDivisionDailyPlan = async (
  req: Request,
  res: Response
) => {
  try {
    const { foreman_id } = req.params;
    await service.newDivisionDailyPlan(Number(foreman_id), req);
    res.json({
      status: "success",
      message: "Division Daily plan successfully created",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: {
        fields: [{ priority: (error as Error).message }],
      },
    });
  }
};

export const approveForemanTodayTasks = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const { spvId } = req.body;
    await service.approveForemanTodayTasks(
      Number(foreman_id),
      Number(task_id),
      Number(spvId)
    );
    res.json({
      status: "success",
      message: "The task successfully approved.",
    });
  } catch (error) {
    res
      .status((error as Error).message === "The Task not found." ? 404 : 304)
      .json({
        status: "error",
        message: (error as Error).message,
      });
  }
};

export const addForemanTask = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const { divisionId, locationId, jobType, area, priority, description } =
      req.body;

    await service.addForemanTask(
      Number(foreman_id),
      Number(task_id),
      Number(divisionId),
      Number(locationId),
      jobType,
      area as string[],
      Number(priority),
      description
    );
    res.json({
      status: "success",
      message: "A new task for daily task has been added successfully",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: {
        priority: [(error as Error).message],
      },
    });
  }
};

export const selfAddForemanTask = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const {
      divisionId,
      locationId,
      jobType,
      area,
      priority,
      description,
      workerNeeded,
      workerAvailable,
      workerNameList,
    } = req.body;

    await service.addForemanTask(
      Number(foreman_id),
      Number(task_id),
      Number(divisionId),
      Number(locationId),
      jobType,
      area as string[],
      Number(priority),
      description,
      workerNeeded,
      workerAvailable,
      workerNameList
    );
    res.json({
      status: "success",
      message: "A new task for daily task has been added successfully",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: {
        priority: [(error as Error).message],
      },
    });
  }
};

export const updateForemanTask = async (req: Request, res: Response) => {
  try {
    const { foreman_id, daily_report_id, task_id } = req.params;
    const {
      locationId,
      area,
      workerNeeded,
      availableWorker,
      workerNameList,
      ImageAttachment,
    } = req.body;

    const result = await service.updateForemanTask(
      Number(foreman_id),
      Number(daily_report_id),
      Number(task_id),
      locationId,
      area,
      workerNeeded,
      availableWorker,
      workerNameList,
      ImageAttachment
    );
  } catch (error) {}
};
