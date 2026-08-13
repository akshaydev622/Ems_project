import * as profileService from "../services/employeeProfileService.js";
import multer from "multer";

// Multer for memory storage (documents)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg", "image/png", "image/jpg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF, images and Word documents are allowed."));
        }
    },
});

export const uploadMiddleware = upload.single("file");

// ─── GET /api/profile/my-profile ──────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
    try {
        const data = await profileService.getMyProfile(req.session.userId);
        if (!data) {
            return res.status(404).json({ success: false, message: "Employee profile not found" });
        }
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

// ─── Personal Details ─────────────────────────────────────────────────────────
export const getPersonalDetails = async (req, res) => {
    try {
        const data = await profileService.getPersonalDetails(req.session.userId);
        if (!data) return res.status(404).json({ success: false, message: "Employee not found" });
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch personal details" });
    }
};

export const updatePersonalDetails = async (req, res) => {
    try {
        const result = await profileService.upsertPersonalDetails(req.session.userId, req.body);
        return res.json({ success: true, data: result });
    } catch (error) {
        if (error.message === "Employee not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to update personal details" });
    }
};

// ─── Bank Details ─────────────────────────────────────────────────────────────
export const getBankDetails = async (req, res) => {
    try {
        const data = await profileService.getBankDetails(req.session.userId);
        if (!data) return res.status(404).json({ success: false, message: "Employee not found" });
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch bank details" });
    }
};

export const upsertBankDetails = async (req, res) => {
    try {
        const { bankName, accountNumber, confirmAccountNumber, ifscCode, branchName, branchAddress, salaryPayMode } = req.body;

        if (!bankName || !accountNumber || !ifscCode || !branchName || !branchAddress) {
            return res.status(400).json({ success: false, message: "Bank name, account number, IFSC, branch name and branch address are required" });
        }

        if (confirmAccountNumber && accountNumber !== confirmAccountNumber) {
            return res.status(400).json({ success: false, message: "Account numbers do not match" });
        }

        // IFSC validation (11 chars, first 4 alpha, 5th is 0, last 6 alphanumeric)
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(ifscCode.toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid IFSC code format" });
        }

        const result = await profileService.upsertBankDetails(req.session.userId, {
            bankName, accountNumber, ifscCode, branchName, branchAddress, salaryPayMode,
        });
        return res.json({ success: true, data: result });
    } catch (error) {
        if (error.message === "Employee not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to save bank details" });
    }
};

// ─── Parent Information ───────────────────────────────────────────────────────
export const getParentInfo = async (req, res) => {
    try {
        const data = await profileService.getParentInfo(req.session.userId);
        if (!data) return res.status(404).json({ success: false, message: "Employee not found" });
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch parent information" });
    }
};

export const upsertParentInfo = async (req, res) => {
    try {
        const result = await profileService.upsertParentInfo(req.session.userId, req.body);
        return res.json({ success: true, data: result });
    } catch (error) {
        if (error.message === "Employee not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to save parent information" });
    }
};

// ─── Qualifications ───────────────────────────────────────────────────────────
export const getQualifications = async (req, res) => {
    try {
        const data = await profileService.getQualifications(req.session.userId);
        if (!data) return res.status(404).json({ success: false, message: "Employee not found" });
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch qualifications" });
    }
};

export const addEducation = async (req, res) => {
    try {
        const { educationLevel, institutionName, courseName, startDate, endDate } = req.body;
        if (!educationLevel || !institutionName || !courseName || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Education level, institution, course, start date and end date are required" });
        }
        const result = await profileService.addEducation(req.session.userId, req.body);
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to add education" });
    }
};

export const updateEducation = async (req, res) => {
    try {
        const { eduId } = req.params;
        const result = await profileService.updateEducation(req.session.userId, eduId, req.body);
        if (!result) return res.status(404).json({ success: false, message: "Education record not found" });
        return res.json({ success: true, data: result });
    } catch (error) {
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to update education" });
    }
};

export const deleteEducation = async (req, res) => {
    try {
        const { eduId } = req.params;
        await profileService.deleteEducation(req.session.userId, eduId);
        return res.json({ success: true });
    } catch (error) {
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to delete education" });
    }
};

export const addExperience = async (req, res) => {
    try {
        const { organizationName, organizationType, startDate, endDate, totalExperience, responsibilities } = req.body;
        if (!organizationName || !organizationType || !startDate || !endDate || !totalExperience || !responsibilities) {
            return res.status(400).json({ success: false, message: "All experience fields are required" });
        }
        const result = await profileService.addExperience(req.session.userId, req.body);
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to add experience" });
    }
};

export const updateExperience = async (req, res) => {
    try {
        const { expId } = req.params;
        const result = await profileService.updateExperience(req.session.userId, expId, req.body);
        if (!result) return res.status(404).json({ success: false, message: "Experience record not found" });
        return res.json({ success: true, data: result });
    } catch (error) {
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to update experience" });
    }
};

export const deleteExperience = async (req, res) => {
    try {
        const { expId } = req.params;
        await profileService.deleteExperience(req.session.userId, expId);
        return res.json({ success: true });
    } catch (error) {
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to delete experience" });
    }
};

export const setFresherStatus = async (req, res) => {
    try {
        const { isFresher } = req.body;
        await profileService.setFresherStatus(req.session.userId, isFresher);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update fresher status" });
    }
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const getDocuments = async (req, res) => {
    try {
        const data = await profileService.getDocuments(req.session.userId);
        if (!data) return res.status(404).json({ success: false, message: "Employee not found" });
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch documents" });
    }
};

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const { documentName } = req.body;
        if (!documentName) {
            return res.status(400).json({ success: false, message: "Document name is required" });
        }
        const doc = await profileService.uploadDocument(req.session.userId, req.file, documentName);
        return res.status(201).json({ success: true, data: doc });
    } catch (error) {
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to upload document" });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { docId } = req.params;
        await profileService.deleteDocument(req.session.userId, docId);
        return res.json({ success: true });
    } catch (error) {
        if (error.message === "Document not found or access denied") {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message === "Employee not found") return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: "Failed to delete document" });
    }
};
