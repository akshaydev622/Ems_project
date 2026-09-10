import { useCallback, useEffect, useMemo, useState } from 'react'
import { 
    Coffee, 
    HeartPulse, 
    Cake, 
    PlusIcon, 
    Calendar, 
    Clock, 
    CalendarDays, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle2,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from "../../context/authcontext.jsx"
import Loading from '../../components/Loading.jsx';
import LeaveHistory from '../../components/leave/leaveHistory.jsx';
import ApplyLeaveModel from '../../components/leave/ApplyLeaveModel.jsx';

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const UserLeave = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleted, setIsDeleted] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [activeTab, setActiveTab] = useState("activity"); // "activity" | "balance"
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [statusFilter, setStatusFilter] = useState("APPROVED"); // "APPROVED" | "ALL"

    const isAdmin = user?.role === "ADMIN";

    const fetchLeaves = useCallback(async () => {
        try {
            const res = await api.get("/leaves");
            const balanceRes = await api.get("/leave-balance", { params: { year: selectedYear } });
            setLeaveBalances(balanceRes.data);
            setLeaves(res.data.data || []);
            if (res.data.employee?.isDeleted) setIsDeleted(true);
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const getLeaveIcon = (leaveType) => {
        const type = (leaveType || "").toLowerCase();
        if (type.includes("casual")) return Coffee;
        if (type.includes("sick")) return HeartPulse;
        if (type.includes("birthday")) return Cake;
        return Calendar;
    };

    const leaveStats = leaveBalances.map((balance) => ({
        label: balance.leaveType,
        total: balance.allocated,
        remaining: balance.remaining,
        used: balance.used,
        icon: getLeaveIcon(balance.leaveType),
    }));

    // Monthly breakdown calculation for the selected year
    const monthlyBreakdown = useMemo(() => {
        const data = MONTH_NAMES.map((monthName, index) => ({
            monthIndex: index,
            month: monthName,
            sick: 0,
            casual: 0,
            birthday: 0,
            total: 0,
        }));

        const eligibleLeaves = leaves.filter((l) => {
            if (statusFilter === "APPROVED") return l.status === "APPROVED";
            return l.status !== "REJECTED";
        });

        eligibleLeaves.forEach((leave) => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

            const rawType = (leave.type || "").toUpperCase();
            let category = "casual";
            if (rawType.includes("SICK")) category = "sick";
            else if (rawType.includes("BIRTHDAY") || rawType.includes("BDAY")) category = "birthday";
            else if (rawType.includes("CASUAL")) category = "casual";

            // Count every day within the leave range that falls into the selected year
            const cur = new Date(start);
            cur.setHours(0, 0, 0, 0);
            const endDay = new Date(end);
            endDay.setHours(0, 0, 0, 0);

            while (cur <= endDay) {
                if (cur.getFullYear() === selectedYear) {
                    const monthIdx = cur.getMonth();
                    data[monthIdx][category] += 1;
                    data[monthIdx].total += 1;
                }
                cur.setDate(cur.getDate() + 1);
            }
        });

        return data;
    }, [leaves, selectedYear, statusFilter]);

    // Annual totals across all 12 months
    const yearlyTotals = useMemo(() => {
        return monthlyBreakdown.reduce(
            (acc, curr) => ({
                sick: acc.sick + curr.sick,
                casual: acc.casual + curr.casual,
                birthday: acc.birthday + curr.birthday,
                total: acc.total + curr.total,
            }),
            { sick: 0, casual: 0, birthday: 0, total: 0 }
        );
    }, [monthlyBreakdown]);

    const currentMonthIndex = new Date().getMonth();
    const isCurrentYear = selectedYear === new Date().getFullYear();

    if (loading) return <Loading />;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="page-header">
                    <h1 className="page-title">Leave Management</h1>
                    <p className="page-subtitle">Your leave history, monthly balance, and requests</p>
                </div>

                <button
                    onClick={() => setShowModel(true)}
                    className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
                >
                    <PlusIcon className="w-4 h-4" /> Apply for leave
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
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
                                <p className="text-sm text-slate-500">{s.label}</p>

                                <div className="flex items-end gap-4 mt-2">
                                    <div>
                                        <p className="text-2xl font-semibold text-slate-900">
                                            {s.remaining}
                                        </p>
                                        <p className="text-xs text-slate-400">Remaining</p>
                                    </div>

                                    <div className="h-8 w-px bg-slate-200" />

                                    <div>
                                        <p className="text-lg font-medium text-slate-700">{s.total}</p>
                                        <p className="text-xs text-slate-400">Total</p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${s.total > 0 ? (s.remaining / s.total) * 100 : 0}%`,
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
            </div>

            {/* Section Switcher Buttons & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                    <button
                        type="button"
                        onClick={() => setActiveTab("activity")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            activeTab === "activity"
                                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Recent Activities</span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                                activeTab === "activity"
                                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                                    : "bg-slate-200 text-slate-600"
                            }`}
                        >
                            {leaves.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("balance")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            activeTab === "balance"
                                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <CalendarDays className="w-4 h-4" />
                        <span>Leave Balance</span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                                activeTab === "balance"
                                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                                    : "bg-slate-200 text-slate-600"
                            }`}
                        >
                            {selectedYear}
                        </span>
                    </button>
                </div>

                {/* Right controls for Leave Balance tab */}
                {activeTab === "balance" && (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter Toggle */}
                        <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                            <button
                                onClick={() => setStatusFilter("APPROVED")}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === "APPROVED"
                                        ? "bg-white text-emerald-700 shadow-xs"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                Approved Only
                            </button>
                            <button
                                onClick={() => setStatusFilter("ALL")}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === "ALL"
                                        ? "bg-white text-indigo-700 shadow-xs"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                All Applications
                            </button>
                        </div>

                        {/* Year Selector */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                            <button
                                onClick={() => setSelectedYear((y) => y - 1)}
                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Previous Year"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-slate-800">
                                {selectedYear}
                            </span>
                            <button
                                onClick={() => setSelectedYear((y) => y + 1)}
                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Next Year"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section: Recent Activities OR Leave Balance */}
            {activeTab === "activity" ? (
                <LeaveHistory leaves={leaves} isAdmin={isAdmin} onUpdate={fetchLeaves} />
            ) : (
                <div className="card overflow-hidden animate-fade-in">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Monthly Leave Breakdown — {selectedYear}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Monthly summary of leave days taken across the year
                            </p>
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                            Showing: {statusFilter === "APPROVED" ? "Approved Leaves" : "All Active Applications"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table-modern w-full">
                            <thead>
                                <tr>
                                    <th className="whitespace-nowrap min-w-[150px]">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Month</span>
                                        </div>
                                    </th>
                                    <th className="whitespace-nowrap text-center min-w-[130px]">
                                        <div className="inline-flex items-center gap-1.5">
                                            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                                            <span>Sick Leave</span>
                                        </div>
                                    </th>
                                    <th className="whitespace-nowrap text-center min-w-[130px]">
                                        <div className="inline-flex items-center gap-1.5">
                                            <Coffee className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Casual Leave</span>
                                        </div>
                                    </th>
                                    <th className="whitespace-nowrap text-center min-w-[130px]">
                                        <div className="inline-flex items-center gap-1.5">
                                            <Cake className="w-3.5 h-3.5 text-pink-500" />
                                            <span>Birthday Leave</span>
                                        </div>
                                    </th>
                                    <th className="whitespace-nowrap text-center min-w-[110px]">
                                        <div className="inline-flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>Total</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyBreakdown.map((row) => {
                                    const isThisMonth = isCurrentYear && row.monthIndex === currentMonthIndex;
                                    return (
                                        <tr
                                            key={row.month}
                                            className={isThisMonth ? "bg-indigo-50/20 font-medium" : ""}
                                        >
                                            <td className="whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-900 font-medium">
                                                        {row.month}
                                                    </span>
                                                    {isThisMonth && (
                                                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Sick Leave */}
                                            <td className="whitespace-nowrap text-center">
                                                {row.sick > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        {row.sick} {row.sick === 1 ? "day" : "days"}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-sm font-normal">0</span>
                                                )}
                                            </td>

                                            {/* Casual Leave */}
                                            <td className="whitespace-nowrap text-center">
                                                {row.casual > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        {row.casual} {row.casual === 1 ? "day" : "days"}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-sm font-normal">0</span>
                                                )}
                                            </td>

                                            {/* Birthday Leave */}
                                            <td className="whitespace-nowrap text-center">
                                                {row.birthday > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                                                        {row.birthday} {row.birthday === 1 ? "day" : "days"}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-sm font-normal">0</span>
                                                )}
                                            </td>

                                            {/* Total */}
                                            <td className="whitespace-nowrap text-center">
                                                {row.total > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        {row.total} {row.total === 1 ? "day" : "days"}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-sm font-normal">0</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* Total Summary Row */}
                            <tfoot>
                                <tr className="bg-slate-50/80 border-t-2 border-slate-200 font-semibold text-slate-900">
                                    <td className="whitespace-nowrap text-slate-800">
                                        Total ({selectedYear})
                                    </td>
                                    <td className="whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100/70 text-rose-800">
                                            {yearlyTotals.sick} days
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100/70 text-amber-800">
                                            {yearlyTotals.casual} days
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-pink-100/70 text-pink-800">
                                            {yearlyTotals.birthday} days
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-xs">
                                            {yearlyTotals.total} days
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Apply Leave Modal */}
            <ApplyLeaveModel
                open={showModel}
                onClose={() => setShowModel(false)}
                onSuccess={() => {
                    fetchLeaves();
                }}
            />
        </div>
    );
};

export default UserLeave;