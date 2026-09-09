import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.js";

const employeeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String },
    profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    signature: { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    employeeCode: { type: String, unique: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    blodGroup: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    nationality: { type: String },
    skillType: { type: String },
    position: { type: String },
    basicSalary: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    employeeStatus: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    dateOfJoining: { type: Date },
    dateOfLeaving: { type: Date },
    employeeType: { type: String },
    employeeStatus: { type: String },
    dateOfConfirmation: { type: Date },
    isDeleted: { type: Boolean, default: false },
    bio: { type: String },
    department: { type: String, enum: DEPARTMENTS },

}, { timestamps: true });

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;