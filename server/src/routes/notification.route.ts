import express from "express";
import {
  sendNotificationHandler,
  getNotificationHistoryHandler,
  getUserNotificationHistoryHandler,
} from "../controllers/notification.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router
  .post("/send", getSocietyMiddleware, sendNotificationHandler)
  .get("/history", getSocietyMiddleware, getNotificationHistoryHandler)
  .get("/users/:userId", getSocietyMiddleware, getUserNotificationHistoryHandler)

export default router;
