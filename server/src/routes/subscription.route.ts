import express from "express";
import {
  getSubscriptionHandler,
  createSubscriptionHandler,
  deleteSubscriptionHandler,
  updateSubscriptionHandler,
  getAllSubscriptionsHandler,
} from "../controllers/subscription.controller.js";

const router = express.Router({ mergeParams: true });

router
  .get("/", getAllSubscriptionsHandler)
  .post("/", createSubscriptionHandler)
  .get("/:subscriptionId", getSubscriptionHandler)
  .patch("/:subscriptionId", updateSubscriptionHandler)
  .delete("/:subscriptionId", deleteSubscriptionHandler);

export default router;
