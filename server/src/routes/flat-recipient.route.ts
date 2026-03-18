import express from "express";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";
import { getFlatRecipientsHandler } from "../controllers/flat-recipients.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", getSocietyMiddleware, getFlatRecipientsHandler);

export default router;
