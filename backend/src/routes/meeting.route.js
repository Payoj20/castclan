import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createMeeting,
  joinMeeting,
  leaveMeeting,
  endMeeting,
  getMyMeeting,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createMeeting);
router.post("/join/:meetingCode", authMiddleware, joinMeeting);
router.post("/leave", authMiddleware, leaveMeeting);
router.post("/end/:meetingCode", authMiddleware, endMeeting);
router.get("/my", authMiddleware, getMyMeeting);

export default router;
