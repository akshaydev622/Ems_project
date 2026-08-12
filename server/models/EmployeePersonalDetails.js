import mongoose from "mongoose";

const employeePersonalDetailsSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    pancardNumber: { type: String, default: null },
    aadharcardNumber: { type: String, default: null },
    passportNumber: { type: String, default: null },
    passportExpiryDate: { type: Date },
    drivingLicenceNumber: { type: String },
    drivingLicenceExpiryDate: { type: Date },
    secondaryEmail: { type: String },
    emergencyContactName: { type: String },
    emergencyContactNumber: { type: String },
    relation: { type: String },
    currentAddress: { type: String },
    currentCountry: { type: String },
    currentState: { type: String },
    currentDistrict: { type: String },
    currentPincode: { type: String },
    permanentAddress: { type: String },
    permanentCountry: { type: String },
    permanentState: { type: String },
    permanentDistrict: { type: String },
    permanentPincode: { type: String },

}, { timeStamps: true });

const EmployeePersonalDetails = mongoose.models.EmployeePersonalDetails || mongoose.model("EmployeePersonalDetails", employeePersonalDetailsSchema);

export default EmployeePersonalDetails
