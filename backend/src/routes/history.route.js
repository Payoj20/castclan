import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getHistory } from "../controllers/history.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getHistory);

export default router;
