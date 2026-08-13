import mongoose from "mongoose";

const employeeQualificationSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    isFresher: { type: Boolean },
    experience: {
        type: [{
            organizationName: { type: String, required: true },
            organizationType: { type: String, required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            totalExperience: { type: String, required: true },
            responsibilities: { type: String, required: true },
        }], default: []
    },
    education: {
        type: [{
            educationLevel: { type: String, required: true },
            institutionName: { type: String, required: true },
            courseName: { type: String, required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            percentage: { type: Number, required: true },
            cgpa: { type: Number, required: true },
            gpa: { type: Number, required: true },
            remarks: { type: String },
        }], default: []
    },

}, { timeStamps: true });

const EmployeeQualification = mongoose.models.EmployeeQualification || mongoose.model("EmployeeQualification", employeeQualificationSchema);

export default EmployeeQualification