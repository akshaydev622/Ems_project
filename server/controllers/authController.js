import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Login for admin and employee
// POST /api/auth/login


export const login = async (req, res) => {
    try {
        const {email, password, role_type} = req.body;
        if(!email || !password) {
            return res.status(400).json({success:false, message:"email and password are required"});
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({success:false, message:"Invalid credentials"});
        }

        if(role_type === "admin" && user.role !== "ADMIN") {
            return res.status(401).json({error:"Not Authorized as admin"});
        }

        if(role_type === "Employee" && user.role !== "EMPLOYEE"){
            return res.status(401).json({error:"Not authorized as Employee"});
        }

        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return res.status(401).json({error: "Invalid credentials"});
        }

        const payload = {
            userId : user._id.toString(),
            role : user.role,
            email : user.email,
        };

        const token = jwt.sing(payload,process.env.JWT_SECRET, {expiresIn:"7d"});
        return res.json({user:payload, token});

    } catch (error) {
        return res.status(500).json({success:false, message:"Error occurred while logging in", error:error.message});

    }
}

// get session for admin and employee

export const session = (req,res) =>{
    const session = req.session;
    return res.json({user:session});

}

// canges password for admin and employee

export const changePassword = async (req, res) =>{
    try{
        const session = req.session;
        const {currentPassword, newPassword} = req.body;
        if(!currentPassword || !newPassword){
            return res.status(400).json({error:"Both password are require"});
        } 
        const user = await User.findById(session.userId);
        if(!user){
            return res.status(401).json({error:"User not found"});
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if(!isValid){
            return res.status(400).json({error:"Current password is Incorrect"});
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(session.userId, {password:hashed});
        return res.json({success:true});
    }catch (error){
        return res.status(500).json({error:"Failded to change password"});
    }
}

