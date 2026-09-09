import Holidays from "../models/Holidays.js";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// GET /api/holidays
export const getHolidays = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        const filter = {};
        if (year) {
            filter.year = Number(year);
        }
        const holidays = await Holidays.find(filter).sort({ date: 1, createdAt: -1 });
        return res.json({ success: true, holidays, data: holidays });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching holidays", error: error.message });
    }
};

// POST /api/holidays
export const createHoliday = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session?.role === "ADMIN";
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Access denied", error: "Access denied" });
        }

        const holidayName = req.body.holidayName || req.body.name;
        const { date, type, description } = req.body;

        if (!holidayName || !holidayName.toString().trim()) {
            return res.status(400).json({ success: false, message: "Holiday name is required", error: "Holiday name is required" });
        }
        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required", error: "Date is required" });
        }
        if (!type) {
            return res.status(400).json({ success: false, message: "Type is required", error: "Type is required" });
        }

        const holidayDate = new Date(date);
        if (isNaN(holidayDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format", error: "Invalid date format" });
        }

        const day = DAYS_OF_WEEK[holidayDate.getDay()];
        const year = holidayDate.getFullYear();

        const holiday = await Holidays.create({
            holidayName: holidayName.toString().trim(),
            day,
            date: holidayDate,
            type,
            year,
            description: description || "",
            createdBy: req.session?.userId || null,
        });

        return res.status(201).json({ success: true, message: "Holiday created successfully", holiday, data: holiday });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Holiday with this name already exists", error: "Holiday with this name already exists" });
        }
        return res.status(500).json({ success: false, message: "Error creating holiday", error: error.message });
    }
};

// PUT /api/holidays/:id
export const updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const holidayName = req.body.holidayName || req.body.name;
        const { date, type, description, status } = req.body;

        const holiday = await Holidays.findById(id);
        if (!holiday) {
            return res.status(404).json({ success: false, message: "Holiday not found", error: "Holiday not found" });
        }

        const updateData = {};
        if (holidayName && holidayName.toString().trim()) {
            updateData.holidayName = holidayName.toString().trim();
        }
        if (date) {
            const holidayDate = new Date(date);
            if (!isNaN(holidayDate.getTime())) {
                updateData.date = holidayDate;
                updateData.day = DAYS_OF_WEEK[holidayDate.getDay()];
                updateData.year = holidayDate.getFullYear();
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

        const updatedHoliday = await Holidays.findByIdAndUpdate(id, updateData, { new: true });
        return res.json({ success: true, message: "Holiday updated successfully", holiday: updatedHoliday, data: updatedHoliday });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Holiday with this name already exists", error: "Holiday with this name already exists" });
        }
        return res.status(500).json({ success: false, message: "Error updating holiday", error: error.message });
    }
};

// DELETE /api/holidays/:id
export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const holiday = await Holidays.findByIdAndDelete(id);
        if (!holiday) {
            return res.status(404).json({ success: false, message: "Holiday not found", error: "Holiday not found" });
        }
        return res.json({ success: true, message: "Holiday deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed deleting holiday", error: error.message });
    }
};