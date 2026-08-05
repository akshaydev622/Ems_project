import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { ispunchIn, PunchIn, PunchOut } from "../services/AttedanceService.js";

// Clock In / Clock Out for employee
export const clockInOut = async (req, res) => {
    try {
        const session = req.session;
        if (!session || !session.userId) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const employee = await Employee.findOne({ userId: session.userId });
        if (!employee) {
            if (session?.role === "ADMIN") {
                return res.status(403).json({ error: "Attendance is available only for employee accounts." });
            }
            return res.status(404).json({ error: "Employee record not found." });
        }

        if (employee.isDeleted) {
            return res.status(403).json({ error: "Your account is deactivated. You cannot clock in/out." });
        }

        const existingAttendance = await ispunchIn(employee._id, req.body);

        if (existingAttendance) {
            if (existingAttendance.punchOut) {
                return res.status(400).json({ error: "Already punched out for today" });
            }
            const updatedRecord = await PunchOut(existingAttendance, req.body);
            return res.status(200).json({
                success: true,
                type: "CHECK_OUT",
                message: "Checked out successfully!",
                data: updatedRecord
            });
        } else {
            const newRecord = await PunchIn(employee._id, req.body);
            if (!newRecord) {
                return res.status(400).json({ error: "Failed to create attendance record" });
            }
            return res.status(200).json({
                success: true,
                type: "CHECK IN",
                message: "Checked in successfully!",
                data: newRecord
            });
        }
    } catch (error) {
        console.error("clockInOut error:", error);
        return res.status(500).json({ error: error.message || "Failed to process clock in/out." });
    }
};

export const getAttendance = async (req, res) => {
    try {
        const session = req.session;
        if (!session || !session.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const employee = await Employee.findOne({ userId: session.userId });
        if (!employee) {
            if (session?.role === "ADMIN") {
                return res.status(403).json({ error: "Attendance is available only for employee accounts." });
            }
            return res.status(400).json({ error: "Employee record not found." });
        }

        const limit = parseInt(req.query.limit || 30, 10);
        const history = await Attendance.find({ employeeId: employee._id }).sort({ date: -1 }).limit(limit);
        return res.json({
            success: true,
            data: history,
            employee: { isDeleted: employee.isDeleted }
        });
    } catch (error) {
        console.error("getAttendance error:", error);
        return res.status(500).json({ error: "Failed to fetch attendance history." });
    }
};

