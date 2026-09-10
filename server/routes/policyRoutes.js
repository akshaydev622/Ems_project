import { Router } from "express";
import multer from "multer";
import { protect, protectAdmin } from "../middleware/auth.js";
import { getPolicies, createPolicy, updatePolicy, deletePolicy } from "../controllers/policyController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
});

const policyRouter = Router();

policyRouter.get("/", protect, getPolicies);
policyRouter.post("/", protect, protectAdmin, upload.single("file"), createPolicy);
policyRouter.put("/:id", protect, protectAdmin, upload.single("file"), updatePolicy);
policyRouter.delete("/:id", protect, protectAdmin, deletePolicy);

export default policyRouter;