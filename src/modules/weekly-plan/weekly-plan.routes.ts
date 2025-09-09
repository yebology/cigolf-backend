import { Router } from "express";
import {
  getWeeklyPlanHistories,
  getWeeklyPlanDetails,
  createWeeklyPlan,
  exportFile,
} from "./weekly-plan.controller";
import { verifyRole, verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  `/export`,
  verifyToken,
  verifyRole(["Admin", "Supervisor"]),
  exportFile
);
router.get(
  `/:id`,
  verifyToken,
  verifyRole(["Admin", "Supervisor"]),
  getWeeklyPlanDetails
);
router.get(
  `/`,
  verifyToken,
  verifyRole(["Admin", "Supervisor"]),
  getWeeklyPlanHistories
);

router.post(
  `/`,
  verifyToken,
  verifyRole(["Admin", "Supervisor"]),
  createWeeklyPlan
);

export default router;
