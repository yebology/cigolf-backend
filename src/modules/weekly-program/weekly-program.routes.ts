import { Router } from "express";
import { getWeeklyPlanHistories } from "./weekly-program.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.get(`/`, verifyToken, getWeeklyPlanHistories);
// router.get(`/:id`, verifyToken, getWeeklyPlanDetail);

export default router;