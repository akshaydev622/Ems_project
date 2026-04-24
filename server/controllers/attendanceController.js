import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";


// clock in out for employee


export const clockInOut = async (req, res)=>{
    const session = req.session;
    const employee = await Employee.findOne({userId:session.userId});
    if(!employee) return res.status(404).json({error:"Employee not found"});
    if(employee.isDeleted) return res.status(403).json({error: "Your Account is deactivated. You can not clock in/out"});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
        employeedId : employee._id,
        date : today,
    });

    const now = new Date();
    if(!existing){
        const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
        const attendance = await Attendance.create({
            employeeId : employee._id,
            date : today,
            checkIn : now,
            status : isLate ? "LATE" : "PRESENT"

        });
        return res.json({success:true, type:"CHECK IN", data:attendance});
    }else if(!existing.checkOut){
        const checkInTime = new Date(existing.checkIn).getTime();
        const diffms = now.getTime() - checkInTime
        const diffhours = diffms / (1000 * 60 *60);

        existing.checkOut = now;

        const workingHours = parseFloat(diffhours.toFixed(2));
        let dayType = "Half Day";
        if(workingHours >= 8) dayType = "Full Day";
        else if(workingHours >= 6) dayType = "Three Quarter Day";
        else if(workingHours > 4) dayType = "Half Day";
        else dayType = "Short Day";
        existing.workingHours = workingHours;
        existing.dayType = dayType;

        await existing.save();
        return res.json({success:type, type:"CHECK_OUT", data:existing });
    }else{
        console.log("Attendence error : ", error);
        return res.status(500).json({error:"Operation Failed"});
    }


}


export const getAttendance = async (req,res)=>{
    try{
        const session = req.session;
        const employee = await Employee.findOne({userId : session.userId});
        if(!employee) return res.status(400).json({error: "Employee not found"});

        const limit = perseInt(req.query.limit || 30);
        const history = (await Attendance.find({employeeId : employee._id})).sort({date:-1}).limit(limit);

        return res.json({success:true, data:history, employee : {isDeleted : employee.isDeleted}})
    }catch(error){
        return res.status(500).json({errro:"Failed to fetch attendance."});
    }
}