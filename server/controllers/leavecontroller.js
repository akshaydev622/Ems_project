import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import LeaveType from "../models/LeaveType.js";
import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";


// create leave


export const createLeave = async (req,res)=>{
    try{

        const session = req.session;
        const employee = await Employee.findOne({userId:session.userId});
        if(!employee) return res.status(404).json({error:"Employee not Found"});
        if(employee.isDeleted) return res.status(403).json({error:"Your account has deactivated. You can not apply for leave"});
        
        const {type, startDate, endDate, reason} = req.body;
        if(!type || !startDate || !endDate || !reason){
            return res.status(400).json({error:"Missing fields"});
        }
        const today = new Date();
        today.setHours(0,0,0,0);
        if(new Date(startDate) <= today || new Date(endDate)  <= today ){
            return res.status(400).json({error:"Leavce Dates must be in future."});
        }

        if(new Date(endDate) < new Date(startDate)){
            return res.status(400).json({errro:"End date cannot before start Date"});
        }

        const leave = await LeaveApplication.create({
            employeeId: employee._id,
            type,
            startDate: new Date(startDate),
            endDate : new Date(endDate),
            reason,
            status: "PENDING",
        });

        return res.json({success:true, data:leave});

    }catch (error){
        return res.status(500).json({error:"Failed"});
    }
}

export const getLeaves = async (req,res)=>{
    try{

        const session = req.session;
        const isAdmin = session.role === "ADMIN";
        if(isAdmin){
            const status = req.query.status;
            const where =  status ? {status} : {};
            const leaves = await LeaveApplication.find(where).populate("employeeId").sort({createdAt : -1});
            const data = leaves.map((l)=>{
                const obj = l.toObject();
                return {
                    ...obj,
                    id: obj._id.toString(),
                    employee: obj.employeeId,
                    employeeId: obj.employeeId?._id?.toString(),
                }
            });
            return res.json({data});
        }else{
            const employee = await Employee.findOne({userId:session.userId});
            if(!employee) return res.status(404).json({error:"Employee not Found"});
            const leaves = await LeaveApplication.find({
                employeeId: employee._id
            }).sort({created:-1});
            return res.json({data:leaves,
                emplyees:{...employee, id:employee._id.toString()}
            });
        }

    }catch (error){
        return res.status(500).json({error:"Failed"});
    }
}


export const updateLeaveStatus = async (req,res)=>{
    try{

        const session = req.session;
        const { status } = req.body;
        if(!["APPROVED", "PENDING", "REJECTED"].includes(status)){
            return res.status(400).json({error:"Invalid Status"});
        };

        const leave = await LeaveApplication.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ error: "Leave application not found" });
        }

        // If approving and it wasn't already approved
        if (status === "APPROVED" && leave.status !== "APPROVED") {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            // Calculate inclusive days
            const diffTime = Math.abs(endDate - startDate);
            const approvedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            // Find LeaveType by matching name (case-insensitive) to LeaveApplication type enum
            const leaveTypeRecord = await LeaveType.findOne({ 
                name: new RegExp(`^${leave.type}$`, 'i'), 
                status: "ACTIVE", 
                isDeleted: false 
            });
            
            if (!leaveTypeRecord) {
                return res.status(400).json({ error: `No active leave type found matching '${leave.type}'` });
            }
            
            const year = startDate.getFullYear();
            
            // Find employee balance
            const balance = await EmployeeLeaveBalance.findOne({
                employeeId: leave.employeeId,
                leaveTypeId: leaveTypeRecord._id,
                year: year,
                isDeleted: false
            });
            
            if (!balance) {
                return res.status(400).json({ error: "No leave balance allocated for this leave type and year." });
            }
            
            if (balance.remaining < approvedDays) {
                return res.status(400).json({ error: `Insufficient leave balance. Requested: ${approvedDays}, Remaining: ${balance.remaining}` });
            }
            
            // Deduct balance
            balance.used += approvedDays;
            balance.remaining -= approvedDays;
            await balance.save();
        }

        leave.status = status;
        await leave.save();
        
        return res.json({success:true, data: leave});
        
    }catch (error){
        console.error("Update leave status error:", error);
        return res.status(500).json({error:"Failed"});
    }
}