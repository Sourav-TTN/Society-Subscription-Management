import express from "express";
import {
  updateBillHandler,
  getAllBillsHandler,
} from "../controllers/bills.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(getSocietyMiddleware);

router.get("/", getAllBillsHandler).patch("/:billId", updateBillHandler);

export default router;
