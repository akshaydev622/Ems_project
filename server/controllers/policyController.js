import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Policies from "../models/Policy.js";
import Media from "../models/Media.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/policies
export const getPolicies = async (req, res) => {
    try {
        const filter = { is_delete: { $ne: true } };
        if(req.query.year){
            filter.year = Number(req.query.year);
        }
        const policies = await Policies.find(filter)
            .populate("media_id")
            .sort({ publishedDate: -1, createdAt: -1 });
        return res.json({ success: true, policies, data: policies });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching policies", error: error.message });
    }
};

// POST /api/policies
export const createPolicy = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session?.role === "ADMIN";
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Access denied", error: "Access denied" });
        }

        const title = req.body.title || req.body.name;
        const { publishedDate, type, description } = req.body;

        if (!title || !title.toString().trim()) {
            return res.status(400).json({ success: false, message: "Policy title is required", error: "Policy title is required" });
        }
        if (!publishedDate) {
            return res.status(400).json({ success: false, message: "Published date is required", error: "Published date is required" });
        }
        if (!type) {
            return res.status(400).json({ success: false, message: "Type is required", error: "Type is required" });
        }

        const policyDate = new Date(publishedDate);
        if (isNaN(policyDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format", error: "Invalid date format" });
        }

        const year = policyDate.getFullYear();

        // If a file was uploaded, save it to storage and create a Media record
        let mediaId = null;
        if (req.file) {
            const uploadDir = path.join(__dirname, "../storage/policies");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const ext = path.extname(req.file.originalname);
            const fileName = `policy_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);

            const media = await Media.create({
                mediaType: "POLICY",
                title: title.toString().trim() || req.file.originalname,
                fileName,
                filePath: `/storage/policies/${fileName}`,
                fileSize: String(req.file.size),
                fileType: req.file.mimetype,
            });

            mediaId = media._id;
        }

        const policy = await Policies.create({
            title: title.toString().trim(),
            publishedDate: policyDate,
            type,
            year,
            media_id: mediaId,
            description: description || "",
            createdBy: req.session?.userId || null,
        });

        const createdPolicy = await Policies.findById(policy._id).populate("media_id");

        return res.status(201).json({
            success: true,
            message: "Policy created successfully",
            policy: createdPolicy,
            data: createdPolicy
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Policy with this title already exists", error: "Policy with this title already exists" });
        }
        return res.status(500).json({ success: false, message: "Error creating policy", error: error.message });
    }
};

// PUT /api/policies/:id
export const updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const title = req.body.title || req.body.name;
        const { publishedDate, type, description, status } = req.body;

        const policy = await Policies.findById(id);
        if (!policy) {
            return res.status(404).json({ success: false, message: "Policy not found", error: "Policy not found" });
        }

        const updateData = {};
        if (title && title.toString().trim()) {
            updateData.title = title.toString().trim();
        }
        if (publishedDate) {
            const policyDate = new Date(publishedDate);
            if (!isNaN(policyDate.getTime())) {
                updateData.publishedDate = policyDate;
                updateData.year = policyDate.getFullYear();
            }
        }
        if (type) {
            updateData.type = type;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (status) {
            updateData.status = status;
        }

        // If a new file is uploaded on update
        if (req.file) {
            const uploadDir = path.join(__dirname, "../storage/policies");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const ext = path.extname(req.file.originalname);
            const fileName = `policy_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);

            const media = await Media.create({
                mediaType: "POLICY",
                title: (title || policy.title || req.file.originalname).toString().trim(),
                fileName,
                filePath: `/storage/policies/${fileName}`,
                fileSize: String(req.file.size),
                fileType: req.file.mimetype,
            });

            updateData.media_id = media._id;
        }

        const updatedPolicy = await Policies.findByIdAndUpdate(id, updateData, { new: true }).populate("media_id");
        return res.json({
            success: true,
            message: "Policy updated successfully",
            policy: updatedPolicy,
            data: updatedPolicy
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Policy with this title already exists", error: "Policy with this title already exists" });
        }
        return res.status(500).json({ success: false, message: "Error updating policy", error: error.message });
    }
};

// DELETE /api/policies/:id
export const deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const policy = await Policies.findById(id);
        if (!policy) {
            return res.status(404).json({ success: false, message: "Policy not found", error: "Policy not found" });
        }

        policy.is_active = false;
        policy.is_delete = true;
        await policy.save();
        return res.json({ success: true, message: "Policy deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed deleting policy", error: error.message });
    }
};