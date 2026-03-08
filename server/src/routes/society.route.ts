import express from "express";
import {
  getAllSocietiesHandler,
  societyCreationHandler,
} from "../controllers/society.controller.js";

const router = express.Router();

router
  .get("/all", getAllSocietiesHandler)
  .post("/create", societyCreationHandler);

export default router;
