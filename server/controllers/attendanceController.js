import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const ATTENDANCE_STATUS = {
    PRESENT: "PRESENT",
    LATE: "LATE",
    ABSENT: "ABSENT",
};

const getDayType = (workingHours) => {
    if(workingHours >= 8) return "Full Day";
    if(workingHours >= 6) return "Three Quarter Day";
    if(workingHours > 4) return "Half Day";
    return "Short Day";
};

const getAttendanceStatus = (checkIn, day) => {
    const onTimeThreshold = new Date(day);
    onTimeThreshold.setHours(10, 0, 0, 0);

    return checkIn.getTime() > onTimeThreshold.getTime()
        ? ATTENDANCE_STATUS.LATE
        : ATTENDANCE_STATUS.PRESENT;
};

const clampAttendanceTimes = (checkIn, checkOut, day) => {
    const startWindow = new Date(day);
    startWindow.setHours(9, 0, 0, 0);

    const startWindowEnd = new Date(day);
    startWindowEnd.setHours(10, 0, 0, 0);

    const endWindowStart = new Date(day);
    endWindowStart.setHours(18, 0, 0, 0);

    const endWindow = new Date(day);
    endWindow.setHours(19, 0, 0, 0);

    const effectiveStart = checkIn.getTime() < startWindow.getTime() ? startWindow : checkIn;
    const effectiveEnd = checkOut.getTime() > endWindow.getTime() ? endWindow : checkOut;

    if(effectiveEnd.getTime() <= effectiveStart.getTime()){
        return 0;
    }

    const diffMs = effectiveEnd.getTime() - effectiveStart.getTime();
    return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
};

// clock in out for employee

export const clockInOut = async (req, res)=>{
    const session = req.session;
    const employee = await Employee.findOne({userId:session.userId});
    if(!employee){
        if(session.role === "ADMIN"){
            return res.status(403).json({error:"Attendance is available only for employee accounts."});
        }
        return res.status(404).json({error:"Employee not found"});
    }
    if(employee.isDeleted) return res.status(403).json({error: "Your Account is deactivated. You can not clock in/out"});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    const previousUnclosed = await Attendance.findOne({
        employeeId: employee._id,
        checkOut: null,
        date: { $lt: today },
    }).sort({ date: -1 });

    if(previousUnclosed){
        const checkOutTime = new Date(previousUnclosed.date);
        checkOutTime.setHours(19, 0, 0, 0);

        const workingHours = clampAttendanceTimes(
            new Date(previousUnclosed.checkIn),
            checkOutTime,
            previousUnclosed.date
        );

        previousUnclosed.checkOut = checkOutTime;
        previousUnclosed.workingHours = workingHours;
        previousUnclosed.dayType = getDayType(workingHours);
        previousUnclosed.status = getAttendanceStatus(new Date(previousUnclosed.checkIn), previousUnclosed.date);
        await previousUnclosed.save();
    }

    const existing = await Attendance.findOne({
        employeeId : employee._id,
        date : today,
    });

    if(!existing){
        const status = getAttendanceStatus(now, today);
        const attendance = await Attendance.create({
            employeeId : employee._id,
            date : today,
            checkIn : now,
            status
        });
        return res.json({success:true, type:"CHECK IN", data:attendance});
    }else if(!existing.checkOut){
        const workingHours = clampAttendanceTimes(
            new Date(existing.checkIn),
            now,
            existing.date
        );

        existing.checkOut = now;
        existing.workingHours = workingHours;
        existing.dayType = getDayType(workingHours);

        await existing.save();
        return res.json({success:true, type:"CHECK_OUT", data:existing });
    }else{
        return res.status(400).json({error:"Already checked out for today"});
    }
}


export const getAttendance = async (req,res)=>{
    try{
        const session = req.session;
        const employee = await Employee.findOne({userId : session.userId});
        if(!employee){
            if(session.role === "ADMIN"){
                return res.status(403).json({error: "Attendance is available only for employee accounts."});
            }
            return res.status(400).json({error: "Employee not found"});
        }

        const limit = parseInt(req.query.limit || 30, 10);
        const history = await Attendance.find({employeeId : employee._id}).sort({date:-1}).limit(limit);

        return res.json({success:true, data:history, employee : {isDeleted : employee.isDeleted}})
    }catch(error){
        return res.status(500).json({errro:"Failed to fetch attendance."});
    }
}