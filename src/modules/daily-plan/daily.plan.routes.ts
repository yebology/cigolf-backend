import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getDailyTaskPlan, getDivisionDailyTaskPlanByDay } from "./daily-plan.controller";

const router = Router()

router.get(`/:foreman_id/daily-task/:task_id`, verifyToken, getDailyTaskPlan)
router.get(`/:foreman_id/daily-task/`, verifyToken, getDivisionDailyTaskPlanByDay)

export default router;