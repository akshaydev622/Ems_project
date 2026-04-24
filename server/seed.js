import "dotenv/config"
import connectDB from "./config/db.js"
import bcrypt from "bcrypt";
import User from "./models/User.js";

const TemporaryPassword = "admin123"

async function registerAdmin(){
    try{
        const admin_email = process.env.ADMIN_EMAIL;
        if(!admin_email){
            console.log("Missing admin_email env variable");
            process.exit(1);
        }

        await connectDB();
        const existingAdmin = await User.findOne({email:process.env.ADMIN_EMAIL});
        if(existingAdmin){
            console.log("User already exist as role", existingAdmin.role);
            process.exit(0);
        }
        
        const hashPassword = await bcrypt.hash(TemporaryPassword,10);
        const admin = await User.create({
            email: process.env.ADMIN_EMAIL,
            password:hashPassword,
            role:"ADMIN",

        });

        console.log("Admin user created");
        console.log("\nEmail: ", admin.email);
        console.log("Password: ", TemporaryPassword);
        console.log("\nChanged the password after login");
    }catch(error){
        console.error("Seed failed: ", error);
    }
}

registerAdmin();