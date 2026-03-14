import express from "express";
import { getAllFlatTypesHanlder } from "../controllers/flat-types.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", getAllFlatTypesHanlder);

export default router;
