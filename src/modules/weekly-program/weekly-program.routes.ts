import { Router } from "express";
import { getWeeklyPlanDetail, getWeeklyPlanHistories } from "./weekly-program.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.get(`/`, verifyToken, getWeeklyPlanHistories);
router.get(`/:WEEKLY_ID`, verifyToken, getWeeklyPlanDetail);

export default router;