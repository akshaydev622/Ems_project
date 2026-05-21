import React, { useCallback, useEffect, useState } from 'react'
import { dummyLeaveData } from '../assets/assets';
import Loading from '../components/Loading';
import { Plus, Search, X } from 'lucide-react';
import { PalmtreeIcon, PlusIcon, ThermometerIcon, UmbrellaIcon } from 'lucide-react';
import LeaveHistory from '../components/leave/leaveHistory';
import ApplyLeaveModel from '../components/leave/ApplyLeaveModel';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from "../context/authcontext.jsx"
import LeaveTypeModel from '../components/leave/LeaveTypeModel.jsx';
import AdminLeave from './leave/AdminLeave.jsx';
import UserLeave from './leave/UserLeave.jsx';


const Leave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data.data || []);
      if (res.data.employee?.isDeleted) setIsDeleted(true);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  if (loading) return <Loading />

  const approvedLeaves = leaves.filter((l) => l.status === "APPROVED");
  const sickCount = approvedLeaves.filter((l) => l.type === "SICK").length;
  const casualCount = approvedLeaves.filter((l) => l.type === "CASUAL").length;
  const annualCount = approvedLeaves.filter((l) => l.type === "ANNUAL").length;

  const leaveStats = [
    { label: "Sick Leave", value: sickCount, icon: ThermometerIcon },
    { label: "Casual Leave", value: casualCount, icon: UmbrellaIcon },
    { label: "Annual Leave", value: annualCount, icon: PalmtreeIcon },
  ]

  return (
    isAdmin ? <AdminLeave /> : <UserLeave />
  )
}

export default Leave