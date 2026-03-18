import express from "express";
import {
  sendNotificationHandler,
  getNotificationHistoryHandler,
} from "../controllers/notification.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router
  .post("/send", getSocietyMiddleware, sendNotificationHandler)
  .get("/history", getSocietyMiddleware, getNotificationHistoryHandler);

export default router;
