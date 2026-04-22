import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";


// GET /api/employee

export const getEmployees = async (req, res) => {
    try {
        const {department} = req.query;
        const where = {};
        if(department) where.department = department;

        const employees = await (await Employee.find(where)).toSorted({createdAt: -1}).populate("userId", "email role").lean();

        const result = employees.map((emp) => ({
            ...emp,
            id:emp._id.toString(),
            user:emp.userId ? {
                email:emp.userId.email,
                role:emp.userId.role
            } : null,

        }));

        res.json({success:true, employees:result});
    }catch (error) {
        return res.status(500).json({success:false, message:"Error fetching employees", error:error.message});
    }
}

// POST /api/create-employee
export const createEmployee = async (req, res) => {
    try {
        const {firstName, lastName, email, phone, position, department, basicSalary, allowance, deductions, joinDate, password, role, bio} = req.body;

        if(!firstName || !email || !phone || !password) {
            return res.status(400).json({success:false, message:"firstName, email, phone and password are required"});
        }

        const haspassword = await bcrypt.hash(password, 10);
        const user = await Employee.create({
            email,
            password:haspassword,
            role: role || "EMPLOYEE",

        });

        const employee = await Employee.create({
            userId:user._id,
            firstName,
            lastName,
            email,
            phone,
            position,
            department: department || "Engineering",
            basicSalary: Number(basicSalary) || 0,
            allowances: Number(allowance) || 0,
            deductions: Number(deductions) || 0,
            joinDate: new Date(joinDate) || new Date(),
            bio: bio || "",
        });
        return res.status(201).json({success:true, message:"Employee created successfully", employee});
    }catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({success:false, message:"Employee with this email already exists"});
        }
        return res.status(500).json({success:false, message:"Error creating employee", error:error.message});
    }
}

// update employee details
// PUT /api/update-employee/:id
export const updateEmployee = async (req, res) => {
     try {
        const {id} = req.params;
        const {firstName, lastName, email, phone, position, department, basicSalary, allowance, deductions, password, role, bio, employeeStatus} = req.body;

        const employee = await Employee.findById(id);
        if(!employee) {
            return res.status(404).json({success:false, message:"Employee not found"});
        };


        await Employee.findByIdAndUpdate(id, {
            firstName,
            lastName,
            email,
            phone,
            position,
            department: department || "Engineering",
            basicSalary: Number(basicSalary) || 0,
            allowances: Number(allowance) || 0,
            deductions: Number(deductions) || 0,
            joinDate: new Date(joinDate) || new Date(),
            bio: bio || "",
        });

        // user update 
        const userUpdate = {email};
        if(role) userUpdate.role = role;
        if(password) userUpdate.password = await bcrypt.hash(password,10);
        await User.findByIdAndUpdate(employee.userId, userUpdate);
        return res.status(201).json({success:true});
    }catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({success:false, message:"Employee with this email already exists"});
        }
        return res.status(500).json({success:false, message:"Error creating employee", error:error.message});
    }
}

// delete employee
// DELETE /api/delete-employee/:id
export const deleteEmployee = async (req, res) => {
    try {
        const {id} = req.params;
        const employee = await Employee.findById(id);
        if(!employee) {
            return res.status(404).json({success:false, message:"Employee not found"});
        }
        employee.isDeleted = true;
        employee.employeeStatus = "INACTIVE";
        await employee.save();
        return res.json({success:true, message:"Employee deleted successfully"});
    }catch (error) {
        return res.status(500).json({success:false, message:"Failed deleting employee", error:error.message});
    }
}