import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import {
    getMyProfile,
    getPersonalDetails, updatePersonalDetails,
    getBankDetails, upsertBankDetails,
    getParentInfo, upsertParentInfo,
    getQualifications,
    addEducation, updateEducation, deleteEducation,
    addExperience, updateExperience, deleteExperience,
    setFresherStatus,
    getDocuments, uploadDocument, deleteDocument,
    uploadMiddleware,
} from "../controllers/employeeProfileController.js";

const profileRouter = Router();

// ── Existing profile routes ──────────────────────────────────────────────────
profileRouter.get("/", protect, getProfile);
profileRouter.put("/", protect, updateProfile);

// ── My Profile overview ──────────────────────────────────────────────────────
profileRouter.get("/my-profile", protect, getMyProfile);

// ── Personal Details ─────────────────────────────────────────────────────────
profileRouter.get("/my-profile/personal", protect, getPersonalDetails);
profileRouter.put("/my-profile/personal", protect, updatePersonalDetails);

// ── Bank Details ─────────────────────────────────────────────────────────────
profileRouter.get("/my-profile/bank", protect, getBankDetails);
profileRouter.post("/my-profile/bank", protect, upsertBankDetails);
profileRouter.put("/my-profile/bank", protect, upsertBankDetails);

// ── Parent Information ────────────────────────────────────────────────────────
profileRouter.get("/my-profile/parents", protect, getParentInfo);
profileRouter.put("/my-profile/parents", protect, upsertParentInfo);

// ── Qualifications — Education ────────────────────────────────────────────────
profileRouter.get("/my-profile/qualifications", protect, getQualifications);
profileRouter.post("/my-profile/qualifications/education", protect, addEducation);
profileRouter.put("/my-profile/qualifications/education/:eduId", protect, updateEducation);
profileRouter.delete("/my-profile/qualifications/education/:eduId", protect, deleteEducation);

// ── Qualifications — Experience ───────────────────────────────────────────────
profileRouter.post("/my-profile/qualifications/experience", protect, addExperience);
profileRouter.put("/my-profile/qualifications/experience/:expId", protect, updateExperience);
profileRouter.delete("/my-profile/qualifications/experience/:expId", protect, deleteExperience);

// ── Qualifications — Fresher status ──────────────────────────────────────────
profileRouter.put("/my-profile/qualifications/fresher", protect, setFresherStatus);

// ── Documents ─────────────────────────────────────────────────────────────────
profileRouter.get("/my-profile/documents", protect, getDocuments);
profileRouter.post("/my-profile/documents", protect, uploadMiddleware, uploadDocument);
profileRouter.delete("/my-profile/documents/:docId", protect, deleteDocument);

export default profileRouter;