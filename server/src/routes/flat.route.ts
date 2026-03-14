import express from "express";
import {
  getFlatHanlder,
  createFlatHandler,
  deleteFlatHanlder,
  updateFlatHanlder,
  getAllFlatsHandler,
  assignOwnerHandler,
  removeOwnerHandler,
} from "../controllers/flat.controller.js";

const router = express.Router({ mergeParams: true });

router
  .get("/", getAllFlatsHandler)
  .get("/:flatId", getFlatHanlder)
  .post("/", createFlatHandler)
  .patch("/:flatId", updateFlatHanlder)
  .delete("/:flatId", deleteFlatHanlder)
  .patch("/:flatId/assign-owner", assignOwnerHandler)
  .patch("/:flatId/remove-owner", removeOwnerHandler);

export default router;
