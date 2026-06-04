import mongoose from "mongoose";

const employeeLeaveBalanceSchema = new mongoose.Schema({
    employeeId: {type: mongoose.Schema.Types.ObjectId, ref:"Employee",default:null},
    leaveTypeId: {type: mongoose.Schema.Types.ObjectId, ref:"LeaveType",default:null},
    year: {type:Number, required:true},
    allocated: {type:Number, default:0},
    used: {type:Number, default:0},
    remaining: {type:Number, default:0},
    reason: {type:String, default:null},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref:"User", default:null},
    status: {type:String, enum:["ACTIVE", "INACTIVE"], default:"ACTIVE"},
    isDeleted: {type:Boolean, default:false},
},{timestamps:true});

// Prevent duplicate allocations for the same employee, leave type, and year
employeeLeaveBalanceSchema.index({ employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

const EmployeeLeaveBalance = mongoose.models.EmployeeLeaveBalance || mongoose.model("EmployeeLeaveBalance", employeeLeaveBalanceSchema);


export default EmployeeLeaveBalance;