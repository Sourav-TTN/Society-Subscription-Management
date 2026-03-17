import express from "express";
import {
  updateBillHandler,
  getAllBillsHandler,
  generateBillHandler,
  getAllPendingBillsHandler,
} from "../controllers/bills.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(getSocietyMiddleware);

router
  .get("/", getAllBillsHandler)
  .get("/pending", getAllPendingBillsHandler)
  .post("/generate/:flatRecipientId", generateBillHandler)
  .patch("/:billId", updateBillHandler);

export default router;
