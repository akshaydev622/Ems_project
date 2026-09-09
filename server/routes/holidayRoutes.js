import { Router } from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from "../controllers/holidayController.js";

const holidayRouter = Router();

holidayRouter.get("/", protect, getHolidays);
holidayRouter.post("/", protect, protectAdmin, createHoliday);
holidayRouter.put("/:id", protect, protectAdmin, updateHoliday);
holidayRouter.delete("/:id", protect, protectAdmin, deleteHoliday);

export default holidayRouter;