import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, X, Coffee, HeartPulse, Cake, PlusIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from "../../context/authcontext.jsx"
import Loading from '../../components/Loading.jsx';
import LeaveHistory from '../../components/leave/leaveHistory.jsx';
import ApplyLeaveModel from '../../components/leave/ApplyLeaveModel.jsx';

const UserLeave = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleted, setIsDeleted] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const isAdmin = user?.role === "ADMIN";
    const year = new Date().getFullYear();

    const fetchLeaves = useCallback(async () => {
        try {
            const res = await api.get("/leaves");
            const balanceRes = await api.get("/leave-balance",{params:{year}});
            setLeaveBalances(balanceRes.data);
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

    const getLeaveIcon = (leaveType) => {
        const type = leaveType.toLowerCase();
        if (type.includes("casual")) return Coffee;
        if (type.includes("sick")) return HeartPulse;
        if (type.includes("birthday")) return Cake;
        return Calendar;
    };

    const leaveStats = leaveBalances.map(balance => ({
        label: balance.leaveType,
        total: balance.allocated,
        remaining: balance.remaining,
        used: balance.used,
        icon: getLeaveIcon(balance.leaveType)
    }));

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="page-header">
                    <h1 className="page-title">Leave Management</h1>
                    <p className="page-subtitle">Your leave history and request</p>
                </div>

                <button onClick={() => setShowModel(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer">
                    <PlusIcon className="w-4 h-4" />Apply for leave
                </button>

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
            
            {/* {leaveStats.map((s)=>(
                <div key={s.label} className="card card-hover p-5 sm:p-6 ralative overflow-hidden group flex items-center gap-4 ">
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/70"/>
                    <div className="p-3 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors duration-200">
                        <s.icon className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="">
                        <p className="text-sm text-slate-500" >{s.label}</p>
                        <p className="text-2xl font-medium text-slate-900 tracking-tight" >{s.total} <span className="text-sm font-normal text-slate-400">token</span></p>
                    </div>
                </div>
            ))} */}

            {leaveStats.map((s) => (
                <div
                    key={s.label}
                    className="card card-hover p-5 sm:p-6 relative overflow-hidden group"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-indigo-500/70" />

                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                            <s.icon className="h-5 w-5 text-slate-500 group-hover:text-indigo-600" />
                        </div>

                        <div className="flex-1">
                            <p className="text-sm text-slate-500">
                                {s.label}
                            </p>

                            <div className="flex items-end gap-4 mt-2">
                                <div>
                                    <p className="text-2xl font-semibold text-slate-900">
                                        {s.remaining}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Remaining
                                    </p>
                                </div>

                                <div className="h-8 w-px bg-slate-200" />

                                <div>
                                    <p className="text-lg font-medium text-slate-700">
                                        {s.total}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Total
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{
                                            width: `${(s.remaining / s.total) * 100}%`
                                        }}
                                    />
                                </div>

                                <p className="text-xs text-slate-400 mt-1">
                                    {s.remaining} of {s.total} days available
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* {leaveStats.map((s) => (
                <div
                    key={s.label}
                    className="card card-hover p-5 sm:p-6 relative overflow-hidden group"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-indigo-500" />

                    <div>
                        <p className="text-sm text-slate-500">
                            {s.label}
                        </p>

                        <div className="mt-2">
                            <p className="text-xl font-semibold text-slate-900">
                                {s.remaining}
                            </p>

                            <p className="text-xs text-slate-500">
                                Remaining of {s.total}
                            </p>
                        </div>
                    </div>
                </div>
            ))} */}
            </div>
            <LeaveHistory leaves={leaves} isAdmin={isAdmin} onUpdate={fetchLeaves} />
            <ApplyLeaveModel open={showModel} onClose={() => setShowModel(false)} onSuccess={() => { fetchLeaves();}} />

        </div>
    )
}

export default UserLeave