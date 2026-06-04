import { Router } from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import { bulkAllotment, individualAllotment, previewBulkAllotment, employeeAllotment, previewEmployeeAllotment, getAllocations, getAllocationSummary, getLeaveBalanceSummary } from "../controllers/leaveAllotmentController.js";

const leaveAllotmentRouter = Router();

// Get allocation summary
leaveAllotmentRouter.get("/summary", protect, protectAdmin, getAllocationSummary);

leaveAllotmentRouter.get("/leave-balance-summary", protect, protectAdmin, getLeaveBalanceSummary);

// Get all leave allotments
leaveAllotmentRouter.get("/", protect, protectAdmin, getAllocations);

// Preview bulk leave allotment - Admin only
leaveAllotmentRouter.post("/preview", protect, protectAdmin, previewBulkAllotment);

// Bulk leave allotment - Admin only
leaveAllotmentRouter.post("/bulk", protect, protectAdmin, bulkAllotment);

// Individual leave allotment (multiple leave types for one employee) - Admin only
leaveAllotmentRouter.post("/individual", protect, protectAdmin, individualAllotment);

// Preview employee leave allotment - Admin only
leaveAllotmentRouter.post("/preview-employee", protect, protectAdmin, previewEmployeeAllotment);

// Employee leave allotment (create single allocation) - Admin only
leaveAllotmentRouter.post("/employee", protect, protectAdmin, employeeAllotment);

export default leaveAllotmentRouter;
