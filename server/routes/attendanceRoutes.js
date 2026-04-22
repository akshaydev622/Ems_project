import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { clockInOut, getAttendance } from "../controllers/attendanceController.js";

const attendanceRoute = Router();

attendanceRoute.post("/", protect, clockInOut);
attendanceRoute.get("/", protect, getAttendance);

export default attendanceRoute;