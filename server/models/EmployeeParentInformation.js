import mongoose from "mongoose";

const employeeParentInformationSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    fatherName: { type: String },
    motherName: { type: String },
    maritalStatus: { type: String, enum: ['married', 'unmarried', 'widow/widower'] },
    spouseName: { type: String },
    spouseDateOfBirth: { type: Date },
    marriedDate: { type: Date },
    children: { type: [{ name: { type: String }, dateOfBirth: { type: Date } }], default: [] },

}, { timeStamps: true });

const EmployeeParentInformation = mongoose.models.EmployeeParentInformation || mongoose.model("EmployeeParentInformation", employeeParentInformationSchema);

export default EmployeeParentInformation