import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, default: null },
    punchIn: { type: Date, default: null },
    punchInCoords: { type: mongoose.Schema.Types.Mixed, default: null },
    punchInAddress: { type: String, default: null },
    punchInComments: { type: String, default: null },
    punchInPhoto: { type: String, default: null },
    punchOut: { type: Date, default: null },
    punchOutCoords: { type: mongoose.Schema.Types.Mixed, default: null },
    punchOutAddress: { type: String, default: null },
    punchOutComments: { type: String, default: null },
    punchOutPhoto: { type: String, default: null },
    checkOut: { type: Date, default: null },
    status: { type: String, enum: ["PRESENT", "ABSENT", "LATE"], default: "PRESENT" },
    workingHours: { type: Number, default: null },
    dayType: { type: String, enum: ["Full Day", "Three Quarter Day", "Half Day", "Short Day", null], default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    modifiedAt: { type: Date, default: null },
    isModified: { type: Boolean, default: false }
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Prevent cached model from stripping newly added fields in Node development environment
if (mongoose.models && mongoose.models.Attendance) {
    delete mongoose.models.Attendance;
}

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;