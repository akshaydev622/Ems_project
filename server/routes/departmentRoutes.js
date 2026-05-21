import { Router } from "express";
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "../controllers/departmentController.js";
import { protect, protectAdmin } from "../middleware/auth.js";

const departmentRouter = Router();

departmentRouter.get("/", protect, getDepartments);
departmentRouter.post("/", protect, protectAdmin, createDepartment);
departmentRouter.put("/:id", protect, protectAdmin, updateDepartment);
departmentRouter.delete("/:id", protect, protectAdmin, deleteDepartment);

export default departmentRouter;