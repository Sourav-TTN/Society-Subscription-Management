import express from "express";
import {
  loginUserHandler,
  createUserHandler,
  getAllUsersHandler,
} from "../controllers/users.controller.js";
import { getSocietyMiddleware } from "../middlewares/society.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(getSocietyMiddleware);

router
  .get("/", getAllUsersHandler)
  .post("/sign-up", createUserHandler)
  .post("/sign-in", loginUserHandler);

export default router;
