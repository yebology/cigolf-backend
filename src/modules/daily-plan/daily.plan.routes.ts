import { Router } from "express";
import { verifyRole, verifyToken } from "../../middleware/auth.middleware";
import {
  getAllDivisionDailyPlan,
  getDailyTaskPlan,
  getDivisionDailyTaskPlanByDay,
} from "./daily-plan.controller";

const router = Router();
router.get(
  `/:foreman_id/daily-task/latest-day`,
  verifyToken,
  verifyRole(["Supervisor", "Admin", "Mandor"]),
  getDivisionDailyTaskPlanByDay
);
router.get(`/:foreman_id/daily-task`, verifyToken, getAllDivisionDailyPlan);
router.get(
  `/:foreman_id/daily-task/:task_id`,
  verifyToken,
  verifyRole(["Supervisor", "Admin", "Mandor"]),
  getDailyTaskPlan
);

export default router;
