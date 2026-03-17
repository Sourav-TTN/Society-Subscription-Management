import express from "express";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";
import { createPaymentHandler } from "../controllers/payment.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", getSocietyMiddleware, createPaymentHandler);

export default router;
