import mongoose from "mongoose";

const employeePersonalDetailsSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    pancardNumber: { type: String, default: null },
    aadharcardNumber: { type: String, default: null },
    passportNumber: { type: String, default: null },
    passportExpiryDate: { type: Date, default: null },
    drivingLicenceNumber: { type: String, default: null },
    drivingLicenceExpiryDate: { type: Date, default: null },
    secondaryEmail: { type: String, default: null },
    emergencyContactName: { type: String, default: null },
    emergencyContactNumber: { type: String, default: null },
    relation: { type: String, default: null },
    currentAddress: { type: String, default: null },
    currentCountry: { type: String, default: null },
    currentState: { type: String, default: null },
    currentDistrict: { type: String, default: null },
    currentPincode: { type: String, default: null },
    permanentAddress: { type: String, default: null },
    permanentCountry: { type: String, default: null },
    permanentState: { type: String, default: null },
    permanentDistrict: { type: String, default: null },
    permanentPincode: { type: String, default: null },

}, { timeStamps: true });

const EmployeePersonalDetails = mongoose.models.EmployeePersonalDetails || mongoose.model("EmployeePersonalDetails", employeePersonalDetailsSchema);

export default EmployeePersonalDetails
