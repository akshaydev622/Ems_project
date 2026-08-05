import Attendance from "../models/Attendance.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const savePhotoToDisk = (base64Photo) => {
    if (!base64Photo) return null;
    try {
        // Strip data URI prefix if present (e.g., "data:image/jpeg;base64,...")
        const matches = base64Photo.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        const base64Data = matches ? matches[2] : base64Photo;

        const photoDir = path.join(__dirname, "../storage/attendancePhotos");
        // Ensure the directory exists
        if (!fs.existsSync(photoDir)) {
            fs.mkdirSync(photoDir, { recursive: true });
        }

        const fileName = `photo_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
        const filePath = path.join(photoDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

        // Return relative URL path to be stored in DB
        return `/storage/attendancePhotos/${fileName}`;
    } catch (err) {
        console.error("Failed to save attendance photo:", err);
        return null;
    }
};

export const getDayTypeAndStatus = (workingHours, currentStatus) => {
    let status = currentStatus || "PRESENT";
    let dayType = "Full Day";

    if (workingHours < 4.0) {
        status = "ABSENT";
        dayType = "Short Day";
    } else if (workingHours < 4.5) {
        dayType = "Short Day";
    } else if (workingHours < 7.0) {
        dayType = "Half Day";
    } else if (workingHours < 7.25) { // 7 Hours 15 Minutes
        dayType = "Short Day";
    } else {
        dayType = "Full Day";
    }

    return { dayType, status };
};


export const getAttendanceStatus = (checkInTime, dayDate) => {
    const onTimeThreshold = new Date(dayDate);
    onTimeThreshold.setHours(10, 0, 0, 0);
    return new Date(checkInTime).getTime() > onTimeThreshold.getTime() ? "LATE" : "PRESENT";
};


export const calculateWorkingHours = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) return 0;
    const diffMs = new Date(punchOut).getTime() - new Date(punchIn).getTime();
    if (diffMs <= 0) return 0;
    return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
};


export const ispunchIn = async (employeeId, bodyOrDate) => {
    let dateVal = new Date();
    if (bodyOrDate) {
        if (bodyOrDate instanceof Date) {
            dateVal = bodyOrDate;
        } else if (typeof bodyOrDate === 'object' && bodyOrDate.date) {
            dateVal = new Date(bodyOrDate.date);
        } else if (typeof bodyOrDate === 'string') {
            dateVal = new Date(bodyOrDate);
        }
    }
    dateVal.setHours(0, 0, 0, 0);
    return await Attendance.findOne({ employeeId, date: dateVal });
};

/**
 * Handles Punch In logic.
 */
export const PunchIn = async (employeeId, body = {}) => {
    const attedanceTime = body.punchIn || body.time ? new Date(body.punchIn || body.time) : new Date();
    const shiftDate = body.date ? new Date(body.date) : new Date(attedanceTime);
    shiftDate.setHours(0, 0, 0, 0);

    // Check if already created for today
    const existing = await Attendance.findOne({ employeeId, date: shiftDate });
    if (existing) {
        throw new Error("Attendance record already exists for today");
    }

    const status = getAttendanceStatus(attedanceTime, shiftDate);

    const attendanceData = {
        employeeId,
        date: shiftDate,
        punchIn: attedanceTime,
        punchInCoords: body.coords || null,
        punchInAddress: body.address || null,
        punchInComments: body.comments || body.note || null,
        punchInPhoto: savePhotoToDisk(body.photo) || null,
        status,
    };

    try {
        return await Attendance.create(attendanceData);
    } catch (error) {
        throw error;
    }
};

/**
 * Handles Punch Out logic and calculates working hours, dayType, and status.
 */
export const PunchOut = async (existingRecord, body = {}) => {
    const attedanceTime = body.time ? new Date(body.time) : new Date();

    if (existingRecord.punchOut) {
        throw new Error("Already punched out for today");
    }

    const punchInTime = existingRecord.punchIn;
    const workingHours = calculateWorkingHours(punchInTime, attedanceTime);

    // Calculate dayType and status based on total working hours
    const { dayType, status } = getDayTypeAndStatus(workingHours, existingRecord.status);

    existingRecord.punchOut = attedanceTime;
    existingRecord.punchOutCoords = body.coords || null;
    existingRecord.punchOutAddress = body.address || null;
    existingRecord.punchOutComments = body.comments || body.note || null;
    existingRecord.punchOutPhoto = savePhotoToDisk(body.photo) || null;
    existingRecord.workingHours = workingHours;
    existingRecord.dayType = dayType;
    existingRecord.status = status;

    await existingRecord.save();
    return existingRecord;
};

