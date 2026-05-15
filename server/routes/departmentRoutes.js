import { Router } from "express";
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from "../controllers/employeeController.js";
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "../controllers/departmentController.js";
import { protect, protectAdmin } from "../middleware/auth.js";

const departmentRouter = Router();

departmentRouter.get("/", protect, protectAdmin, getDepartments);
departmentRouter.post("/", protect, protectAdmin, createDepartment);
departmentRouter.put("/:id", protect, protectAdmin, updateDepartment);
departmentRouter.delete("/:id", protect, protectAdmin, deleteDepartment);

export default departmentRouter;