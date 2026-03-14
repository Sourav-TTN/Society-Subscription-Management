import express from "express";
import {
  createUserHandler,
  getAllUsersHandler,
} from "../controllers/users.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(getSocietyMiddleware);

router.get("/", getAllUsersHandler).post("/", createUserHandler);

export default router;
