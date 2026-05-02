import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { summarizeMeeting } from "../controllers/summarizer.controller.js";


const router = express.Router();

const upload = multer({dest: "uploads/"});

router.post("/summarize", authMiddleware, upload.single("audio"), summarizeMeeting);

export default router;