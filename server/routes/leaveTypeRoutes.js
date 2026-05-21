import { Router } from "express";
import { createLeaveType, deleteLeaveType, getLeaveTypes, updateLeaveType } from "../controllers/leaveTypeController.js";
import { protect, protectAdmin } from "../middleware/auth.js";

const leaveTypeRouter = Router();

leaveTypeRouter.get("/", protect, getLeaveTypes);
leaveTypeRouter.post("/", protect, protectAdmin, createLeaveType);
leaveTypeRouter.put("/:id", protect, protectAdmin, updateLeaveType);
leaveTypeRouter.delete("/:id", protect, protectAdmin, deleteLeaveType);

export default leaveTypeRouter;