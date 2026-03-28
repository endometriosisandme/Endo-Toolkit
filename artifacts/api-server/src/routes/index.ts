import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import painLogsRouter from "./painLogs";
import symptomLogsRouter from "./symptomLogs";
import medicationLogsRouter from "./medicationLogs";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(painLogsRouter);
router.use(symptomLogsRouter);
router.use(medicationLogsRouter);
router.use(reportsRouter);

export default router;
