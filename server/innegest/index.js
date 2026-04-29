import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Ems_support" });


const autoCheckOut = inngest.createFunction(
  { id: "auto-check-out", triggers:[{event: "employee/check-out"}]},
  async ({ event, step }) => {
    const{employeeId, attendanceId} = event.data;

    await step.sleepUntil("wait-for-the-9-hours", new Data(new Date().getTime()+9*60*60*1000));
    
    const attendance = await Attendance.findById(attendanceId);
    if(!attendance?.checkOut){
        const employee = await Employee.findById(employeeId);

        // send mail
        console.log("email has send");
        //  after 10 hours, mark attendance as checkOut
        await step.sleepUntil("wait-for-the-1-hours", new Data(new Date().getTime()+1*60*60*1000));

        attendance = await Attendance.findById(attendanceId);
        if(!attendance?.checkOut){
            attendance.checkOut = new Date(attendance.checkIn).getTime() + 4*60*60*1000;
            attendance.workingHours = 4;
            attendance.dayType = "Half Day";
            attendance.status = "LATE";
            await attendance.save();
        }
    }


  },
);

const leaveApplicationReminder = inngest.createFunction(
  { id: "leave-application-reminder", triggers:[{event: "leave/pending"}]},
    async ({event, step}) =>{
        const {leaveApplicationId} = event.data;

        // wait for 24 hours

        await step.sleepUntil("wait-for-24-hours", new Date(new Date().getTime() + 24 * 60 * 60 * 1000))

        const leaveApplication = await LeaveApplication.findById(leaveApplicationId);

        if(leaveApplication?.status === "PENDING"){
            const employee = Employee.findById(leaveApplication.employeeId);
            console.log("email has sended");
        }
    }
 
);


const attendanceReminderCron = inngest.createFunction(
    {id:"attendance-reminder-crone", triggers:[{cron:"TZ=Asia/Kolkata 30 11 * * *"}] }, // 6 o'clock utc = 11:30 AM
    async ({step}) =>{
        const today = await step.run("get-today-date", ()=>{
            const startUTC = new Date(new Date().toLocaleDateString("en-CA", {timeZone : "Asia/Kolkata"}) + "T00:00:00+05:30");
            const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
            return{startUTC:startUTC.toISOString(), endUTC:endUTC.toISOString()}
        })

        const activeEmployees = await step.run("get-active-employee",async ()=>{
            const employees = await Employee.find({
                isDeleted : false,
                employmentStatus:"ACTIVE",
            }).lean();
            return employees.map((e)=>({_id: e._id.toString(),
                firstName: e.firstName, lastName: e.lastName, email:e.email,
                department:e.department, 
            }))
        })

        const onLeaveIds = await step.run("get-on-leave-ids", async ()=>{
            const leaves = await LeaveApplication.find({
                status: "APPROVED",
                startDate: {$lte : new Date(today.endUTC)},
                lastDate: {$gte : new Date(today.startUTC)}
            }).lean();
            return leaves.map((l)=>l.employeeId.toString());
        });

        const checkInIds = await step.run("get-checked-in-ids", async()=>{
            const attendances = await Attendance.find({
                date:{$gte:new Date(today.startUTC), $lt:new Date(today.endUTC)},
            }).lean();
            return attendances.map((e)=>e.employeeId.toString());
        });

        const absentEmployees = activeEmployees.filter((emp)=>!onLeaveIds.includes(emp._id) && !checkedInIds.includes(emp._id))

        if(absentEmployees.length > 0){
            await step.run("send-reminder-emails", async ()=>{
                const  emailPromises = absentEmployees.map((emp)=>{
                    // send email
                    console.log("email has sended");
                })
            })
        }

        return {totalActive: activeEmployees.length, onLeave:onLeaveIds.length, absent:absentEmployees.length}
    }

);


// Create an empty array where we'll export future Inngest functions
export const functions = [
    autoCheckOut,
    leaveApplicationReminder,
    attendanceReminderCron
];