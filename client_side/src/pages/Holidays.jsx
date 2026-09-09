import { useCallback, useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from "../context/authcontext.jsx";
import HolidayForm from '../components/holiday/HolidayForm';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Holidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editHoliday, setEditHoliday] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { user } = useAuth(null);
    const isAdmin = user?.role === "ADMIN";

    const fetchHolidays = useCallback(async () => {
        try {
            const res = await api.get("/holidays");
            setHolidays(res.data.holidays || res.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    const handleDeleteHoliday = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;
        try {
            await api.delete(`/holidays/${id}`);
            toast.success("Holiday deleted successfully");
            fetchHolidays();
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="page-title">Holidays</h1>
                    <p className="page-subtitle">
                        {isAdmin
                            ? "Generate and manage company holidays"
                            : "List of company holidays for calendar year " + new Date().getFullYear() + "."}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Plus size={16} /> Add Holiday
                    </button>
                )}
            </div>

            {/* Create Holiday Modal */}
            {showCreateModal && (
                <div
                    className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Add Holiday</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Create a new holiday</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <HolidayForm
                                initialData={null}
                                onCancel={() => setShowCreateModal(false)}
                                onSuccess={() => {
                                    setShowCreateModal(false);
                                    fetchHolidays();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Holiday Modal */}
            {editHoliday && (
                <div
                    className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setEditHoliday(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Edit Holiday</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Update Holiday Details</p>
                            </div>
                            <button
                                onClick={() => setEditHoliday(null)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <HolidayForm
                                initialData={editHoliday}
                                onCancel={() => setEditHoliday(null)}
                                onSuccess={() => {
                                    setEditHoliday(null);
                                    fetchHolidays();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Holiday Name</th>
                                <th>Day</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                {isAdmin && <th className="text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {holidays.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-slate-400">
                                        No Holidays Found
                                    </td>
                                </tr>
                            ) : (
                                holidays.map((holiday) => {
                                    const formattedDate = holiday.date
                                        ? new Date(holiday.date).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                          })
                                        : "-";
                                    return (
                                        <tr key={holiday._id || holiday.id}>
                                            <td className="font-medium text-slate-900">
                                                {holiday.holidayName || holiday.name}
                                            </td>
                                            <td className="text-slate-600">{holiday.day || "-"}</td>
                                            <td className="text-slate-600">{formattedDate}</td>
                                            <td>
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    {holiday.type || "Holiday"}
                                                </span>
                                            </td>
                                            <td className="text-slate-500 max-w-xs truncate">
                                                {holiday.description || "-"}
                                            </td>
                                            {isAdmin && (
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => setEditHoliday(holiday)}
                                                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                                                            title="Edit holiday"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHoliday(holiday._id || holiday.id)}
                                                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                                                            title="Delete holiday"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Holidays;