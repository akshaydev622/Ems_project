import mongoose from "mongoose"

const EmployeeDocumentsSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    documentName: { type: String, require: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
    isVisible: { type: Boolean, default: true },
    documentStatus: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    remarks: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const EmployeeDocuments = mongoose.models.EmployeeDocuments || mongoose.model("EmployeeDocuments", EmployeeDocumentsSchema);
export default EmployeeDocuments