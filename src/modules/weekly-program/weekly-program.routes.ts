import { Router } from "express";
import { getWeeklyPlanHistories } from "./weekly-program.controller";

const router = Router()

router.get(`/`, getWeeklyPlanHistories);

export default router;