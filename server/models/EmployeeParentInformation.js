import mongoose from "mongoose";

const employeeParentInformationSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    fatherName: { type: String, default: null },
    motherName: { type: String, default: null },
    maritalStatus: { type: String, enum: ['married', 'unmarried', 'widow/widower'], default: null },
    spouseName: { type: String, default: null },
    spouseDateOfBirth: { type: Date, default: null },
    marriedDate: { type: Date, default: null },
    children: { type: [{ name: { type: String }, dateOfBirth: { type: Date } }], default: [] },

}, { timeStamps: true });

const EmployeeParentInformation = mongoose.models.EmployeeParentInformation || mongoose.model("EmployeeParentInformation", employeeParentInformationSchema);

export default EmployeeParentInformation