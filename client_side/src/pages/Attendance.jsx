import React, { useCallback, useEffect, useState } from 'react'
import Loading from '../components/Loading';
import CheckinButton from '../components/attendance/CheckinButton';
import AttendanceStats from '../components/attendance/AttendanceStats';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authcontext.jsx';

const Attendance = () => {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  const fetchData =  useCallback(async ()=>{
    try{
      const res = await api.get("/attendance");
      const json = res.data;
      setHistory(json.data || []);
      if(json.employee?.isDeleted) setIsDeleted(true);
    }catch(error){
      toast.error("Error fetching attendance data:", error);
    }finally{
      setLoading(false);
    } 
  },[]);

  useEffect(()=>{
    if(user?.role !== "EMPLOYEE"){
      setLoading(false);
      return;
    }
    fetchData();
  },[fetchData, user])

  if(authLoading || loading) return <Loading />;

  const today = new Date();
  today.setHours(0,0,0,0)

  const todayRecord = history.find( (r)=> new Date(r.date).toDateString() === today.toDateString());

  if(user?.role !== "EMPLOYEE"){
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Attendance is available only for employees.</p>
        </div>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700">
          <p className="font-medium">Attendance access</p>
          <p className="mt-2 text-sm text-slate-600">Your current account role does not have an attendance record. Contact your administrator if this is incorrect.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track your work hours and daily check-ins</p>
      </div>

      {isDeleted ? (
        <div className="bm-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <p className="text-rose-600">
            You can no longer clock in or out because your employee record has been marked as deleted.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <CheckinButton todayRecord={todayRecord} onAction={fetchData} />
        </div>
      )}
      <AttendanceStats history={history} />
      <AttendanceHistory history={history} />
    </div>

  )
}

export default Attendance