import express from "express";
import {
  updateBillHandler,
  getAllBillsHandler,
  generateBillHandler,
  getAllUserBillsHandler,
  getAllPendingBillsHandler,
  getAllPendingUserBillsHandler,
} from "../controllers/bills.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(getSocietyMiddleware);

router
  .get("/", getAllBillsHandler)
  .get("/pending", getAllPendingBillsHandler)
  .post("/generate/:flatRecipientId", generateBillHandler)
  .get("/users/:userId", getAllUserBillsHandler)
  .get("/users/:userId/pending", getAllPendingUserBillsHandler)
  .patch("/:billId", updateBillHandler);

export default router;
