import { useEffect, useState } from 'react'
import { CalendarDays, FileText, Loader2, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const FALLBACK_LEAVE_TYPES = [
    { _id: 'sick', name: 'Sick Leave', annualLimit: 6 },
    { _id: 'casual', name: 'Casual Leave', annualLimit: 12 },
    { _id: 'birthday', name: 'Birthday Leave', annualLimit: 1 },
];

const ApplyLeaveModel = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    useEffect(() => {
        if (!open) return;

        const fetchLeaveTypes = async () => {
            try {
                setLoadingTypes(true);
                const res = await api.get("/leave-types");
                const activeTypes = (res.data.leaveTypes || []).filter(
                    (lt) => lt.status === "ACTIVE" && !lt.isDeleted
                );
                
                const typesToUse = activeTypes.length > 0 ? activeTypes : FALLBACK_LEAVE_TYPES;
                setLeaveTypes(typesToUse);
                
                if (typesToUse.length > 0) {
                    setSelectedType(typesToUse[0].name);
                    setSelectedTypeId(typesToUse[0]._id && !typesToUse[0]._id.startsWith('fallback') ? typesToUse[0]._id : "");
                }
            } catch (error) {
                console.error("Failed to fetch leave types:", error);
                setLeaveTypes(FALLBACK_LEAVE_TYPES);
                setSelectedType(FALLBACK_LEAVE_TYPES[0].name);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchLeaveTypes();
        setStartDate("");
        setEndDate("");
    }, [open]);

    const requestedDays = (() => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return null;
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    })();

    const handleTypeChange = (e) => {
        const typeName = e.target.value;
        setSelectedType(typeName);
        const matched = leaveTypes.find((lt) => lt.name === typeName);
        if (matched && matched._id && matched._id.length === 24) {
            setSelectedTypeId(matched._id);
        } else {
            setSelectedTypeId("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (selectedTypeId) {
            data.leaveTypeId = selectedTypeId;
        }

        try {
            await api.post("/leaves", data);
            toast.success("Leave applied successfully");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const displayTypes = leaveTypes.length > 0 ? leaveTypes : FALLBACK_LEAVE_TYPES;

    return (
        <div
            className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 pb-0">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Apply Leave</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Submit your leave request for approval
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Leave Type <span className="text-rose-500">*</span>
                            </label>
                            {loadingTypes && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Loading types...
                                </span>
                            )}
                        </div>

                        <select
                            name="type"
                            value={selectedType}
                            onChange={handleTypeChange}
                            required
                            disabled={loadingTypes}
                            className="cursor-pointer"
                        >
                            {displayTypes.map((lt) => (
                                <option key={lt._id || lt.name} value={lt.name}>
                                    {lt.name}
                                </option>
                            ))}
                        </select>
                        <input type="hidden" name="leaveTypeId" value={selectedTypeId} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                Duration <span className="text-rose-500">*</span>
                            </label>
                            {requestedDays !== null && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {requestedDays} {requestedDays === 1 ? "day" : "days"} requested
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-slate-400 mb-1">From</span>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    min={minDate}
                                />
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 mb-1">To</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    min={startDate || minDate}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Reason <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            required
                            rows={3}
                            className="resize-none"
                            placeholder="Briefly describe why you need this leave..."
                        />
                    </div>

                    <div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                type="button"
                                className="btn-secondary flex-1 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1 flex items-center justify-center gap-2 cursor-pointer"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {loading ? "Submitting..." : "Submit Application"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeaveModel;