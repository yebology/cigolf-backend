import { Router } from "express";
import { getWeeklyPlanHistories, getWeeklyPlanDetails } from "./weekly-program.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.get(`/`, verifyToken, getWeeklyPlanHistories);
router.get(`/:id`, verifyToken, getWeeklyPlanDetails);

export default router;