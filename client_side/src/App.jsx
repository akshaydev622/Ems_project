import {Toaster} from "react-hot-toast"
import {Navigate, Route, Routes} from "react-router-dom"
import Login from "./pages/Login"
import Leave from "./pages/Leave"
import AdminLeave from "./pages/leave/AdminLeave.jsx"
import AllLeaves from "./pages/leave/AllLeaves.jsx"
import LeaveTypes from "./pages/leave/LeaveTypes.jsx"
import Payslips from "./pages/Payslips"
import PrintPaySlip from "./pages/PrintPaySlip"
import Settings from "./pages/Settings"
import Layout from "./pages/Layout"
import Dashboard from "./pages/Dashboard"
import LoginFrom from "./components/LoginFrom"
import Attendance from "./pages/Attendance"
import Employees from "./pages/Employees"
import Departments from "./pages/Departments"

const App = () => {
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/admin/login" element={<LoginFrom role="admin" title="Admin Portal" subtitle="Sign in to manage the organization" />} />
      <Route path="/employee/login" element={<LoginFrom role="employee" title="Employee Portal" subtitle="Sign in to access your profile and records" />} />

      <Route element={<Layout/>} >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/leave" element={<Leave />}>
          <Route element={<AdminLeave />}>
            <Route index element={<AllLeaves />} />
            <Route path="types" element={<LeaveTypes />} />
          </Route>
        </Route>
        <Route path="/payslips" element={<Payslips />} />
        <Route path="/print-payslip" element={<PrintPaySlip />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/print/payslip/:id" element={<PrintPaySlip />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  )
}

export default App
