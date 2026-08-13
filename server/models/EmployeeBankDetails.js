import mongoose from "mongoose";

const EmployeeBankDetailsSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    salaryPayMode: { type: String, enum: ["BANK_TRANSFER", "CHEQUE", "DEMAND_DRAFT", "CASE_IN_HAND"] },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    branchName: { type: String, required: true },
    branchAddress: { type: String, required: true },
    reimbursment: {
        type: [{
            bankName: { type: String },
            accountNumber: { type: String },
            ifscCode: { type: String },
            branchName: { type: String },
            branchAddress: { type: String },
            reimbursment: { type: String }
        }],
        default: []
    },
}, { timestamps: true });

const EmployeeBankDetails = mongoose.models.EmployeeBankDetails || mongoose.model("EmployeeBankDetails", EmployeeBankDetailsSchema);
export default EmployeeBankDetails;