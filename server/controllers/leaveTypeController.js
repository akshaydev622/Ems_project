import LeaveType from "../models/LeaveType.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";


// GET /api/leave-types
export const getLeaveTypes = async (req, res) =>{
    try{
        const session = req.session;
        const isAdmin = session.role === "ADMIN";
        // if(!isAdmin){
        //     return res.status(403).json({success:false, message:"Access denied"});
        // }

        const leaveTypes = await LeaveType.find({isDeleted: false}).sort({createdAt: -1});
        return res.json({success:true, leaveTypes});

    }catch(error){
        return res.status(500).json({success:false, message:"Error fetching leave types", error:error.message});
    }
}

// POST /api/create-leave-type
export const createLeaveType = async (req, res) => {
    try{
        const {name, maxDaysAllowed, status} = req.body;
        if(!name || maxDaysAllowed === undefined) {
            return res.status(400).json({success:false, message:"Name and maximum days allowed are required"});
        }
        const leaveType = await LeaveType.create({
            name,
            maxDaysAllowed,
            status: status || "ACTIVE",
            createdBy: req.session.userId,
        });
        return res.status(201).json({success:true, message:"Leave type created successfully", leaveType});
    }catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({success:false, message:"Leave type with this name or code already exists"});
        }
        return res.status(500).json({success:false, message:"Error creating leave type", error:error.message});
    }
}


// update leave type details
// PUT /api/update-leave-type/:id
export const updateLeaveType = async (req, res) => {
     try {
        const {id} = req.params;
        const {parentId, description, status} = req.body;

        const leaveType = await LeaveType.findById(id);
        if(!leaveType) {
            return res.status(404).json({success:false, message:"Leave type not found"});
        }

        await LeaveType.findByIdAndUpdate(id, {
            parentId: parentId || null,
            description,
            status
        });
        return res.json({success:true, message:"Leave type updated successfully"});
    }catch (error) {
        return res.status(500).json({success:false, message:"Error updating leave type", error:error.message});
    }
}


// delete leave type
// DELETE /api/delete-leave-type/:id
export const deleteLeaveType = async (req, res) => {
    try {
        const {id} = req.params;
        const leaveType = await LeaveType.findById(id);
        if(!leaveType) {
            return res.status(404).json({success:false, message:"Leave type not found"});
        }
        leaveType.status = "INACTIVE";
        leaveType.isDeleted = true;
        await leaveType.save();
        return res.json({success:true, message:"Leave type deleted successfully"});
    }catch (error) {
        return res.status(500).json({success:false, message:"Failed deleting leave type", error:error.message});
    }
}