import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema({
    name: {type:String, required:true, unique:true},
    maxDaysAllowed: {type:Number, required:true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref:"User",default:null},
    status: {type:String, enum:["ACTIVE", "INACTIVE"], default:"ACTIVE"},
    isDeleted: {type:Boolean, default:false},
},{timestamps:true});

const LeaveType = mongoose.models.LeaveType || mongoose.model("LeaveType", leaveTypeSchema);


export default LeaveType;