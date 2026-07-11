import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import customersRouter from "./customers";
import loansRouter from "./loans";
import paymentsRouter from "./payments";
import dashboardRouter from "./dashboard";
import calculatorRouter from "./calculator";
import reportsRouter from "./reports";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(customersRouter);
router.use(loansRouter);
router.use(paymentsRouter);
router.use(dashboardRouter);
router.use(calculatorRouter);
router.use(reportsRouter);
router.use(notificationsRouter);

export default router;
