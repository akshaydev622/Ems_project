import express from 'express';
import cors from 'cors';
import "dotenv/config";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import profileRouter from './routes/profileRoutes.js';
import attendanceRoute from './routes/attendanceRoutes.js';
import leaveRouter from './routes/leaveRoutes.js';
import payslipRouter from './routes/payslipRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import { serve } from "inngest/express";
import { inngest, functions } from "./innegest/index.js";
import departmentRouter from './routes/departmentRoutes.js';
import leaveTypeRouter from './routes/leaveTypeRoutes.js';
import leaveAllotmentRouter from './routes/leaveAllotmentRoutes.js';
import leaveBalanceRouter from './routes/leaveBalanceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(multer().none());

// Serve static storage files (attendance photos, etc.)
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Routes
app.get('/', (req, res) => res.send("server is running"));
app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/profile/", profileRouter);
app.use("/api/attendance/", attendanceRoute);
app.use("/api/leaves/", leaveRouter);
app.use("/api/payslips/", payslipRouter);
app.use("/api/dashboard/", dashboardRouter);
app.use("/api/departments/", departmentRouter);
app.use("/api/leave-types/", leaveTypeRouter);
app.use("/api/leave-allotment/", leaveAllotmentRouter);
app.use("/api/leave-balance/", leaveBalanceRouter);

app.use("/api/inngest", serve({ client: inngest, functions }));

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});