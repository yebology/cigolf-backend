import { Router } from "express";
import { getWeeklyPlanHistories, getWeeklyPlanDetails, createWeeklyPlan } from "./weekly-program.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.get(`/`, verifyToken, getWeeklyPlanHistories);
router.get(`/:id`, verifyToken, getWeeklyPlanDetails);
router.post(`/create`, verifyToken, createWeeklyPlan);

export default router;