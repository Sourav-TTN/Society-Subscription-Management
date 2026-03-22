import express from "express";
import {
  getRevenueVsOutstandingHandler,
  getCompleteDashboardDataHandler,
  getMonthlyCollectionTrendsHandler,
  getPaymentMethodDistributionHandler,
} from "../controllers/dashboard.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(getSocietyMiddleware);

router
  .get("/", getCompleteDashboardDataHandler)
  .get("/revenue-vs-outstanding", getRevenueVsOutstandingHandler)
  .get("/monthly-collection-trend", getMonthlyCollectionTrendsHandler)
  .get("/payment-method-distribution", getPaymentMethodDistributionHandler);

export default router;
