import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema({
    holidayName: {type:String, required:true, unique:true},
    day : {type:String,},
    date: { type: Date, required: true },
    type: {type: String},
    year: {type:Number, required:true},
    description: {type:String,default:null},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref:"User",default:null},
    status: {type:String, enum:["ACTIVE", "INACTIVE"], default:"ACTIVE"},
},{timestamps:true});

const Holiday = mongoose.models.Holiday|| mongoose.model("Holiday", HolidaySchema);

export default Holiday;