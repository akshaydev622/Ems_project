import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {type:String, required:true, unique:true},
    code: {type:String, required:true, unique:true},
    parentId: {type: mongoose.Schema.Types.ObjectId, ref:"Department", default:null},
    description: {type:String},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref:"User",default:null},
    status: {type:String, enum:["ACTIVE", "INACTIVE"], default:"ACTIVE"},
    isDeleted: {type:Boolean, default:false}
},{timestamps:true});

const Department = mongoose.models.Department || mongoose.model("Department", departmentSchema);

export default Department;