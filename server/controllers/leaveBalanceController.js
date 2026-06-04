import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";
import Employee from "../models/Employee.js";

export const getLeaveBalances = async (req, res) => {
    try {
        const session = req.session;
        const {year} = req.query; 
        const employee = await Employee.findOne({ userId: session.userId });
        
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const filter = {
            employeeId: employee._id,
            isDeleted: false,            
        }

        // Optional year filter
        if (year) {
            filter.year = Number(year);
        }

        const balances = await EmployeeLeaveBalance.find(filter).populate("leaveTypeId", "name");

        const formattedBalances = balances.map(b => ({
            leaveType: b.leaveTypeId?.name || "Unknown",
            allocated: b.allocated,
            used: b.used,
            remaining: b.remaining,
            year: b.year
        }));

        return res.json(formattedBalances);
    } catch (error) {
        console.error("Get leave balances error:", error);
        return res.status(500).json({ error: "Failed to fetch leave balances" });
    }
};
