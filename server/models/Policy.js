import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
    title: {type:String, required:true},
    publishedDate: { type: Date, required: true },
    type: {type: String},
    year: {type:Number, required:true},
    media_id: {type:mongoose.Schema.Types.ObjectId, ref:"Media",default:null},
    description: {type:String, default:null},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref:"User",default:null},
    status: {type:String, enum:["ACTIVE", "INACTIVE"], default:"ACTIVE"},
    is_active : {type:Boolean, default:true},
    is_delete: {type:Boolean, default:false}
},{timestamps:true});

const Policy = mongoose.models.Policy|| mongoose.model("Policy", PolicySchema);

export default Policy;