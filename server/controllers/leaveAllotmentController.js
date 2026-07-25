import Employee from "../models/Employee.js";
import LeaveType from "../models/LeaveType.js";
import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";

// Bulk Leave Allotment
export const bulkAllotment = async (req, res) => {
    try {
        const { year, leaveTypeIds } = req.body;
        const adminId = req.session?.userId;

        // Validate year
        if (!year || typeof year !== "number" || year < 2000 || year > 2100) {
            return res.status(400).json({ error: "Invalid year provided" });
        }

        // Validate leaveTypeIds
        if (!leaveTypeIds || !Array.isArray(leaveTypeIds) || leaveTypeIds.length === 0) {
            return res.status(400).json({ error: "No leave types selected" });
        }

        // Fetch and validate leave types
        const leaveTypes = await LeaveType.find({
            _id: { $in: leaveTypeIds },
            status: "ACTIVE",
            isDeleted: false,
        });

        if (leaveTypes.length === 0) {
            return res.status(400).json({ error: "No valid active leave types found" });
        }

        if (leaveTypes.length !== leaveTypeIds.length) {
            return res.status(400).json({ error: "Some selected leave types are invalid or inactive" });
        }

        // Fetch all active employees
        const employees = await Employee.find({
            employeeStatus: "ACTIVE",
            isDeleted: false,
        });

        if (employees.length === 0) {
            return res.status(400).json({ error: "No active employees found" });
        }

        let recordsCreated = 0;
        let duplicatesSkipped = 0;
        const errors = [];

        // Loop through each employee
        for (const employee of employees) {
            // Loop through each leave type
            for (const leaveType of leaveTypes) {
                try {
                    // Check if allocation already exists
                    const existingBalance = await EmployeeLeaveBalance.findOne({
                        employeeId: employee._id,
                        leaveTypeId: leaveType._id,
                        year: year,
                        isDeleted: false,
                    });

                    if (existingBalance) {
                        duplicatesSkipped++;
                        continue;
                    }

                    // Create new employee leave balance
                    await EmployeeLeaveBalance.create({
                        employeeId: employee._id,
                        leaveTypeId: leaveType._id,
                        year: year,
                        allocated: leaveType.annualLimit,
                        used: 0,
                        remaining: leaveType.annualLimit,
                        createdBy: adminId,
                        status: "ACTIVE",
                    });

                    recordsCreated++;
                } catch (error) {
                    errors.push({
                        employeeId: employee._id.toString(),
                        leaveTypeId: leaveType._id.toString(),
                        error: error.message,
                    });
                }
            }
        }

        return res.json({
            success: true,
            employeesProcessed: employees.length,
            recordsCreated,
            duplicatesSkipped,
            leaveTypesProcessed: leaveTypes.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Bulk allotment error:", error);
        return res.status(500).json({ error: "Failed to process bulk allotment" });
    }
};

// Individual Leave Allotment
export const individualAllotment = async (req, res) => {
    try {
        const { employeeId, allocations, year } = req.body;
        const adminId = req.session?.userId;

        // Validate year
        if (!year || typeof year !== "number" || year < 2000 || year > 2100) {
            return res.status(400).json({ error: "Invalid year provided" });
        }

        // Validate employeeId
        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID is required" });
        }

        // Verify employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Validate allocations
        if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
            return res.status(400).json({ error: "No leave allocations provided" });
        }

        let recordsCreated = 0;
        let duplicatesSkipped = 0;
        const errors = [];

        // Process each allocation
        for (const allocation of allocations) {
            try {
                const { leaveTypeId, days } = allocation;

                // Validate allocation data
                if (!leaveTypeId || typeof days !== "number" || days <= 0) {
                    errors.push({
                        leaveTypeId,
                        error: "Invalid leave type ID or days",
                    });
                    continue;
                }

                // Fetch leave type
                const leaveType = await LeaveType.findById(leaveTypeId);
                if (!leaveType || leaveType.status !== "ACTIVE" || leaveType.isDeleted) {
                    errors.push({
                        leaveTypeId,
                        error: "Leave type not found or inactive",
                    });
                    continue;
                }

                // Validate days don't exceed annual limit
                if (days > leaveType.annualLimit) {
                    errors.push({
                        leaveTypeId,
                        error: `Days (${days}) exceed annual limit (${leaveType.annualLimit})`,
                    });
                    continue;
                }

                // Check if allocation already exists
                const existingBalance = await EmployeeLeaveBalance.findOne({
                    employeeId: employee._id,
                    leaveTypeId: leaveType._id,
                    year: year,
                    isDeleted: false,
                });

                if (existingBalance) {
                    duplicatesSkipped++;
                    continue;
                }

                // Create new employee leave balance
                await EmployeeLeaveBalance.create({
                    employeeId: employee._id,
                    leaveTypeId: leaveType._id,
                    year: year,
                    allocated: days,
                    used: 0,
                    remaining: days,
                    createdBy: adminId,
                    status: "ACTIVE",
                });

                recordsCreated++;
            } catch (error) {
                errors.push({
                    leaveTypeId: allocation.leaveTypeId,
                    error: error.message,
                });
            }
        }

        return res.json({
            success: true,
            employeeId: employeeId,
            recordsCreated,
            duplicatesSkipped,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Individual allotment error:", error);
        return res.status(500).json({ error: "Failed to process individual allotment" });
    }
};

// Preview Bulk Leave Allotment
export const previewBulkAllotment = async (req, res) => {
    try {
        const { year, leaveTypeIds } = req.body;

        // Validate year
        if (!year || typeof year !== "number" || year < 2000 || year > 2100) {
            return res.status(400).json({ error: "Invalid year provided" });
        }

        // Validate leaveTypeIds
        if (!leaveTypeIds || !Array.isArray(leaveTypeIds) || leaveTypeIds.length === 0) {
            return res.status(400).json({ error: "No leave types selected" });
        }

        // Fetch and validate leave types
        const leaveTypes = await LeaveType.find({
            _id: { $in: leaveTypeIds },
            status: "ACTIVE",
            isDeleted: false,
        });

        if (leaveTypes.length === 0) {
            return res.status(400).json({ error: "No valid active leave types found" });
        }

        if (leaveTypes.length !== leaveTypeIds.length) {
            return res.status(400).json({ error: "Some selected leave types are invalid or inactive" });
        }

        // Count active employees
        const employeeCount = await Employee.countDocuments({
            employeeStatus: "ACTIVE",
            isDeleted: false,
        });

        if (employeeCount === 0) {
            return res.status(400).json({ error: "No active employees found" });
        }

        // Calculate expected records
        const expectedRecords = employeeCount * leaveTypes.length;

        // Format leave types for response
        const formattedLeaveTypes = leaveTypes.map(lt => ({
            id: lt._id.toString(),
            name: lt.name,
            days: lt.annualLimit,
        }));

        return res.json({
            year,
            employeeCount,
            leaveTypes: formattedLeaveTypes,
            expectedRecords,
        });
    } catch (error) {
        console.error("Preview bulk allotment error:", error);
        return res.status(500).json({ error: "Failed to generate preview" });
    }
};

// Individual Employee Leave Allotment
export const employeeAllotment = async (req, res) => {
    try {
        const { employeeId, leaveTypeId, year, days, reason } = req.body;
        const adminId = req.session?.userId;

        // Validate inputs
        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID is required" });
        }

        if (!leaveTypeId) {
            return res.status(400).json({ error: "Leave type ID is required" });
        }

        if (!year || typeof year !== "number" || year < 2000 || year > 2100) {
            return res.status(400).json({ error: "Invalid year provided" });
        }

        if (typeof days !== "number" || days <= 0) {
            return res.status(400).json({ error: "Days must be a positive number" });
        }

        // Verify employee exists and is active
        const employee = await Employee.findById(employeeId);
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ error: "Employee not found" });
        }

        if (employee.employeeStatus !== "ACTIVE") {
            return res.status(400).json({ error: "Employee is not active" });
        }

        // Verify leave type exists and is active
        const leaveType = await LeaveType.findById(leaveTypeId);
        if (!leaveType || leaveType.status !== "ACTIVE" || leaveType.isDeleted) {
            return res.status(404).json({ error: "Leave type not found or inactive" });
        }

        // Check if days exceed annual limit
        if (days > leaveType.annualLimit) {
            return res.status(400).json({
                error: `Days (${days}) exceed annual limit (${leaveType.annualLimit})`
            });
        }

        // Check if allocation already exists
        let existingBalance = await EmployeeLeaveBalance.findOne({
            employeeId: employee._id,
            leaveTypeId: leaveType._id,
            year: year,
            isDeleted: false,
        });

        if (existingBalance) {
            return res.status(400).json({ error: "Leave already allotted for this employee, leave type and year." });
        }

        // Create new record
        const newBalance = await EmployeeLeaveBalance.create({
            employeeId: employee._id,
            leaveTypeId: leaveType._id,
            year: year,
            allocated: days,
            used: 0,
            remaining: days,
            reason: reason || null,
            createdBy: adminId,
            status: "ACTIVE",
        });

        return res.json({
            success: true,
            message: "Leave allocation created successfully",
            data: {
                _id: newBalance._id.toString(),
                employeeId: newBalance.employeeId.toString(),
                leaveTypeId: newBalance.leaveTypeId.toString(),
                year: newBalance.year,
                allocated: newBalance.allocated,
                used: newBalance.used,
                remaining: newBalance.remaining,
                reason: newBalance.reason,
                status: newBalance.status,
                createdBy: newBalance.createdBy?.toString(),
                createdAt: newBalance.createdAt,
            },
            isNew: true,
        });
    } catch (error) {
        console.error("Employee allotment error:", error);
        return res.status(500).json({ error: "Failed to process employee allotment" });
    }
};

// Preview Employee Leave Allotment
export const previewEmployeeAllotment = async (req, res) => {
    try {
        const { employeeId, leaveTypeId, year, days } = req.body;

        // Validate inputs
        if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });
        if (!leaveTypeId) return res.status(400).json({ error: "Leave type ID is required" });
        if (!year || typeof year !== "number" || year < 2000 || year > 2100) return res.status(400).json({ error: "Invalid year provided" });
        if (typeof days !== "number" || days <= 0) return res.status(400).json({ error: "Days must be a positive number" });

        // Verify employee exists and is active
        const employee = await Employee.findById(employeeId);
        if (!employee || employee.isDeleted) return res.status(404).json({ error: "Employee not found" });
        if (employee.employeeStatus !== "ACTIVE") return res.status(400).json({ error: "Employee is not active" });

        // Verify leave type exists and is active
        const leaveType = await LeaveType.findById(leaveTypeId);
        if (!leaveType || leaveType.status !== "ACTIVE" || leaveType.isDeleted) return res.status(404).json({ error: "Leave type not found or inactive" });

        // Check if days exceed annual limit
        if (days > leaveType.annualLimit) {
            return res.status(400).json({
                error: `Days (${days}) exceed annual limit (${leaveType.annualLimit})`
            });
        }

        // Check if allocation already exists
        const existingBalance = await EmployeeLeaveBalance.findOne({
            employeeId: employee._id,
            leaveTypeId: leaveType._id,
            year: year,
            isDeleted: false,
        });

        if (existingBalance) {
            return res.status(400).json({ error: "Leave already allotted for this employee, leave type and year." });
        }

        return res.json({
            success: true,
            data: {
                employeeName: `${employee.firstName} ${employee.lastName}`,
                leaveTypeName: leaveType.name,
                year,
                annualLimit: leaveType.annualLimit,
                requestedDays: days
            }
        });
    } catch (error) {
        console.error("Preview employee allotment error:", error);
        return res.status(500).json({ error: "Failed to generate preview" });
    }
};

// Get Allocation History
export const getAllocations = async (req, res) => {
    try {
        const { page = 1, limit = 10, year, employeeId } = req.query;

        const filter = { isDeleted: false };
        if (year) {
            filter.year = Number(year);
        }
        if (employeeId) {
            filter.employeeId = employeeId;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const total = await EmployeeLeaveBalance.countDocuments(filter);

        const allocations = await EmployeeLeaveBalance.find(filter)
            .populate("employeeId", "firstName lastName email")
            .populate("leaveTypeId", "name type")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return res.json({
            data: allocations,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get allocations error:", error);
        return res.status(500).json({ error: "Failed to fetch allocation history" });
    }
};

// Get Allocation Summary
export const getAllocationSummary = async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) {
            return res.status(400).json({ error: "Year is required" });
        }
        const filterYear = Number(year);

        const filter = { year: filterYear, isDeleted: false };

        // Count total allocations
        const totalAllocations = await EmployeeLeaveBalance.countDocuments(filter);

        // Count unique employees
        const uniqueEmployees = await EmployeeLeaveBalance.distinct("employeeId", filter);
        const employeesAllocated = uniqueEmployees.length;

        // Count unique leave types
        const uniqueLeaveTypes = await EmployeeLeaveBalance.distinct("leaveTypeId", filter);
        const leaveTypesCount = uniqueLeaveTypes.length;

        return res.json({
            year: filterYear,
            employeesAllocated,
            totalAllocations,
            leaveTypes: leaveTypesCount
        });
    } catch (error) {
        console.error("Get allocation summary error:", error);
        return res.status(500).json({ error: "Failed to fetch allocation summary" });
    }
};

export const getLeaveBalanceSummary = async (req, res) => {
    try {
        const { year } = req.query;
        const match = {
            isDeleted: false
        };
        if (year) {
            match.year = Number(year);
        }
        const balances = await EmployeeLeaveBalance.find(match)
            .populate("employeeId", "firstName lastName")
            .populate("leaveTypeId", "name");


        const result = {};

        balances.forEach(item => {
            const key = `${item.employeeId._id}-${item.year}`;
            if (!result[key]) {
                result[key] = {
                    employeeId: item.employeeId._id,
                    employeeName: `${item.employeeId.firstName} ${item.employeeId.lastName}`,
                    year: item.year,
                    leaveBalances: []
                };
            }

            let code = item.leaveTypeId.name;
            if (code) {
                code = code.split(' ').map(w => w[0]).join('').toUpperCase();
            } else {
                code = "UN";
            }

            result[key].leaveBalances.push({
                code: code,
                allocated: item.allocated,
                used: item.used,
                remaining: item.remaining
            });
        });

        return res.json({
            data: Object.values(result)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch leave balance summary"
        });
    }
};
