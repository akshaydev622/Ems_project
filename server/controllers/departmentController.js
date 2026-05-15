import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";


// GET /api/departments
export const getDepartments = async (req, res) =>{
    try{
        const session = req.session;
        const isAdmin = session.role === "ADMIN";
        if(!isAdmin){
            return res.status(403).json({success:false, message:"Access denied"});
        }
        
        const departments = await Department.find({isDeleted: false}).populate("parentId", "name").sort({createdAt: -1});
        return res.json({success:true, departments});
      
    }catch(error){
        return res.status(500).json({success:false, message:"Error fetching departments", error:error.message});
    }
}

// POST /api/create-department
export const createDepartment = async (req, res) => {
    try{
        const {name, parentId, description} = req.body;
        if(!name) {
            return res.status(400).json({success:false, message:"Name is required"});
        }
        function generateDepartmentCode(name) {
            const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
            const random = Math.floor(10000 + Math.random() * 90000);
            const code = `${prefix}${random}`;
            return code || "";
        }
        console.log(req.session);
        const department = await Department.create({
            name,
            code: generateDepartmentCode(name),
            parentId: parentId || null,
            description: description || "",
            createdBy: req.session.userId,
        });
        return res.status(201).json({success:true, message:"Department created successfully", department});
    }catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({success:false, message:"Department with this name or code already exists"});
        }
        return res.status(500).json({success:false, message:"Error creating department", error:error.message});
    }
}


// update department details
// PUT /api/update-department/:id
export const updateDepartment = async (req, res) => {
     try {
        const {id} = req.params;
        const {parentId, description, status} = req.body;

        const department = await Department.findById(id);
        if(!department) {
            return res.status(404).json({success:false, message:"Department not found"});
        }

        await Department.findByIdAndUpdate(id, {
            parentId: parentId || null,
            description,
            status
        });
        return res.json({success:true, message:"Department updated successfully"});
    }catch (error) {
        return res.status(500).json({success:false, message:"Error updating department", error:error.message});
    }
}


// delete department
// DELETE /api/delete-department/:id
export const deleteDepartment = async (req, res) => {
    try {
        const {id} = req.params;
        const department = await Department.findById(id);
        if(!department) {
            return res.status(404).json({success:false, message:"Department not found"});
        }
        department.status = "INACTIVE";
        department.isDeleted = true;
        await department.save();
        return res.json({success:true, message:"Department deleted successfully"});
    }catch (error) {
        return res.status(500).json({success:false, message:"Failed deleting department", error:error.message});
    }
}