import express from "express";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";
import {
  getReportsDataHandler,
  reportGenerationHandler,
} from "../controllers/report.controller.js";

const router = express.Router({ mergeParams: true });

router
  .get("/", getSocietyMiddleware, getReportsDataHandler)
  .get("/generate-report", getSocietyMiddleware, reportGenerationHandler);

export default router;
