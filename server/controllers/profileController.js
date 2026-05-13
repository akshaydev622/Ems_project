import Employee from "../models/Employee.js";
import User from "../models/User.js";


// get profile


export const getProfile = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({userId: session.userId});

        if(!employee){
            const user = await User.findById(session.userId);
            return res.json({
                firstName: "Admin",
                lastName: "",
                email: user?.email || session.email,
                position: session.role,
                bio: user?.bio || "",
                isDeleted: false,
            });
        }

        return res.json(employee);
    } catch (error) {
        return res.status(500).json({error:"Failed to fetch profile"});
    }
}

// update profile

export const updateProfile = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({userId: session.userId});
        if(!employee){
            if(session.role === "ADMIN"){
                await User.findByIdAndUpdate(session.userId, {bio:req.body.bio});
                return res.json({success:true});
            }
            return res.status(404).json({error:"Employee not found"});
        }

        if(employee.isDeleted) return res.status(403).json({error:"Your account is deactivated. You cannot update your profile"});

        await Employee.findByIdAndUpdate(employee._id, {bio:req.body.bio});
        return res.json({success:true});
    } catch (error) {
        return res.status(500).json({error:"Failed to update profile."});
    }
}

