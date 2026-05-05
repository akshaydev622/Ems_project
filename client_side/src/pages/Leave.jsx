import React, { useCallback, useEffect, useState } from 'react'
import { dummyLeaveData } from '../assets/assets';
import Loading from '../components/Loading';
import { Plus, Search, X } from 'lucide-react';
import { PalmtreeIcon, PlusIcon, ThermometerIcon, UmbrellaIcon } from 'lucide-react';
import LeaveHistory from '../components/leave/leaveHistory';
import ApplyLeaveModel from '../components/leave/ApplyLeaveModel';

const Leave = () => {

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showModel, setShowModel] = useState(false);

  const isAdmin = false;
  const fetchLeaves = useCallback(()=>{
    setLeaves(dummyLeaveData);
    setTimeout(()=>{
      setLoading(false);
    },1000);
  },[])

  useEffect(()=>{
    fetchLeaves();
  },[fetchLeaves]);

  if(loading) return <Loading />

  const approvedLeaves = leaves.filter((l)=>l.status === "APPROVED");
  const sickCount = approvedLeaves.filter((l)=>l.type === "SICK").length;
  const casualCount = approvedLeaves.filter((l)=>l.type === "CASUAL").length;
  const annualCount = approvedLeaves.filter((l)=>l.type === "ANNUAL").length;

  const leaveStats = [
    {label:"Sick Leave", value: sickCount, icon:ThermometerIcon},
    {label:"Casual Leave", value: casualCount, icon:UmbrellaIcon},
    {label:"Annual Leave", value: annualCount, icon:PalmtreeIcon},
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="page-header">
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">{isAdmin ? "Manage Leave Applications" : "Your leave history and request"}</p>
        </div>
        {!isAdmin && !isDeleted && (
          <button onClick={ ()=>setShowModel(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer">
            <PlusIcon className="w-4 h-4" />Apply for leave
          </button>
        )}
      </div>
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {leaveStats.map((s)=>(
            <div key={s.label} className="card card-hover p-5 sm:p-6 ralative overflow-hidden group flex items-center gap-4 ">
                 <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/70"/>
                 <div className="p-3 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors duration-200">
                    <s.icon className="h-5 w-5 text-slate-500" />
                 </div>
                 <div className="">
                    <p className="text-sm text-slate-500" >{s.label}</p>
                    <p className="text-2xl font-medium text-slate-900 tracking-tight" >{s.value} <span className="text-sm font-normal text-slate-400">token</span></p>
                 </div>
            </div>
          ))}
        </div>
      )}

      <LeaveHistory leaves={leaves} isAdmin={isAdmin} onUpdate={fetchLeaves} />

      <ApplyLeaveModel open={showModel} onClose={()=>setShowModel(false)} onSuccess={fetchLeaves} />

    </div>
  )
}

export default Leave