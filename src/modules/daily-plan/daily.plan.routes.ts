import { Router } from "express";
import { verifyRole, verifyToken } from "../../middleware/auth.middleware";
import {
  addForemanTask,
  approveForemanTodayTasks,
  createNewDivisionDailyPlan,
  getAllDivisionDailyPlan,
  getDailyTaskPlan,
  getDivisionDailyTaskPlanByDay,
  updateForemanTask,
} from "./daily-plan.controller";

const router = Router();

router.post(
  `/:foreman_id/daily-task/:task_id/add-new`,
  verifyToken,
  verifyRole(["Supervisor", "Admin"]),
  addForemanTask
);
router.post(
  `/:foreman_id/daily-task/:task_id/approve`,
  verifyToken,
  verifyRole(["Supervisor", "Admin"]),
  approveForemanTodayTasks
);
router.post(
  `/:foreman_id/daily-task`,
  verifyToken,
  verifyRole(["Supervisor", "Admin"]),
  createNewDivisionDailyPlan
);

router.put(
  `/:foreman_id/daily-task/:daily_report_id/update_task/:task_id`,
  verifyToken,
  verifyRole(["Supervisor", "Admin", "Mandor"]),
  updateForemanTask
);

router.get(
  `/:foreman_id/daily-task/latest-day`,
  verifyToken,
  verifyRole(["Supervisor", "Admin", "Mandor"]),
  getDivisionDailyTaskPlanByDay
);
router.get(
  `/:foreman_id/daily-task/:task_id`,
  verifyToken,
  verifyRole(["Supervisor", "Admin", "Mandor"]),
  getDailyTaskPlan
);
router.get(
  `/:foreman_id/daily-task`,
  verifyToken,
  verifyRole(["Supervisor", "Admin", "Mandor"]),
  getAllDivisionDailyPlan
);

export default router;
