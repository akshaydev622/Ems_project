import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getLeaveBalances } from "../controllers/leaveBalanceController.js";

const leaveBalanceRouter = Router();

// Get employee leave balances
leaveBalanceRouter.get("/", protect, getLeaveBalances);

export default leaveBalanceRouter;
