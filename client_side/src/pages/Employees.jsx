import React, { useCallback, useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import api from '../api/axios';
import { DEPARTMENTS, dummyEmployeeData } from '../assets/assets.jsx';
import { Plus, Search, X } from 'lucide-react';
import EmployeeCard from '../components/EmployeeCard.jsx';
import EmployeeForm from '../components/EmployeeForm.jsx';
import EmployeeList from '../components/employee/EmployeeList.jsx';
import Button from '../components/shared/utils/Button.jsx';

const Employees = () => {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [editEmployee, setEditEmployee] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const location = useLocation()
  const isTeamsRoute = location.pathname === '/employees/teams'
  const isAllEmployeesRoute = location.pathname === '/employees' || location.pathname === '/employees/'

  const navButtonBase = 'inline-flex items-center justify-center gap-2 min-w-35 px-4 py-2 rounded-md text-sm font-medium transition duration-200'
  const activeButton = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
  const inactiveButton = 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 shadow-sm'
  

  const fetchEmployees = useCallback(async ()=>{
    try{
      const url = selectedDept ? `/employees?department=${selectedDept}` : "/employees";
      const res = await api.get(url)
      setEmployees(res.data.employees);
    }catch(error){
      console.error("Failed to fetch employees");
    }finally{
      setLoading(false);
    }
  },[selectedDept]) 

  useEffect(()=>{
    fetchEmployees();
  },[fetchEmployees]);

  const filtered = employees.filter((emp)=>`${emp.firstName} ${emp.lastName} ${emp.position}`.toLowerCase().includes(search.toLowerCase())) 

  return (
    <div className="animate-fade-in">
      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 ">
        <div>
          <h1 className="page-title">Employee</h1>
          <p className="page-subtitle">Manage your tems members</p>
        </div>
        <button onClick={()=>setShowCreateModal(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center" >
          <Plus size={16} /> Add Employee
        </button>
        {/* <Button variant="primary" onClick={()=>setShowCreateModal(true)} leftIcon={<Plus size={16} />} >Add Employee</Button> */}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          to="/employees"
          className={`${navButtonBase} ${isAllEmployeesRoute ? activeButton : inactiveButton}`}
        >
          All Employees
        </Link>
        <Link
          to="/employees/teams"
          className={`${navButtonBase} ${isTeamsRoute ? activeButton : inactiveButton}`}
        >
          Teams
        </Link>
      </div>
      <Outlet />


    </div>
  )
}

export default Employees