import { useAuth } from '../../context/authcontext'
import { useCallback, useEffect, useState } from 'react'
import { PlusIcon, FileText, FileTextIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import {format} from 'date-fns'
import LeaveHistory from '../../components/leave/leaveHistory'
import LeaveTypeModel from '../../components/leave/LeaveTypeModel'
import ConfirmModal from '../../components/ConfirmModal'

const AdminLeave = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleted, setIsDeleted] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState("");
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "Confirm Action",
        message: "",
        okText: "Yes",
        loading: false,
        onConfirm: null,
    });
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

    const fetchLeaveTypes = useCallback(async () => {
        try {
          const res = await api.get("/leave-types");
          setLeaveTypes(res.data.leaveTypes || []);
        } catch (error) {
          toast.error(error.response?.data?.error || error.message);
        }
    }, []);

    const handleStatusUpdate = async (typeId, newStatus) => {
        try {
            setStatusUpdating(typeId);
            setConfirmState((prev) => ({ ...prev, loading: true }));
            await api.put(`/leave-types/${typeId}`, { status: newStatus });
            toast.success("Leave type status updated successfully");
            fetchLeaveTypes();
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        } finally {
            setStatusUpdating("");
            setConfirmState((prev) => ({ ...prev, open: false, loading: false }));
        }
    };

    const requestStatusChange = (typeId, currentStatus, newStatus) => {
        if (currentStatus === newStatus) return;

        setConfirmState({
            open: true,
            title: "Confirm Status Change",
            message: `Change leave type status from ${currentStatus} to ${newStatus}?`,
            okText: newStatus === "INACTIVE" ? "Delete" : "Yes",
            loading: false,
            onConfirm: () => handleStatusUpdate(typeId, newStatus),
        });
    };

    const onEdit = (type) => {
        setEditingType(type);
        setShowModel(true);
    };

    const handleDelete = (type) => {
        setConfirmState({
            open: true,
            title: "Confirm Delete",
            message: `Are you sure you want to delete ${type.name}?`,
            okText: "Delete",
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmState((prev) => ({ ...prev, loading: true }));
                    const typeId = type._id || type.id;
                    await api.delete(`/leave-types/${typeId}`);
                    toast.success("Leave type deleted successfully");
                    fetchLeaveTypes();
                } catch (error) {
                    toast.error(error.response?.data?.error || error.message);
                } finally {
                    setConfirmState((prev) => ({ ...prev, open: false, loading: false }));
                }
            },
        });
    };

    const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false, loading: false }));
    const confirmAction = async () => {
        if (confirmState.onConfirm) await confirmState.onConfirm();
    };

  useEffect(() => {
    fetchLeaves();
    fetchLeaveTypes();
  }, [fetchLeaves, fetchLeaveTypes]);

  if (loading) return <Loading />

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="page-header">
                <h1 className="page-title">Leave Management</h1>
                <p className="page-subtitle">Manage Leave Applications</p>
                </div>
                <button onClick={() => { setEditingType(null); setShowModel(true); }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer">
                <PlusIcon className="w-4 h-4" />Add Leave Type
                </button>

            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <a
                    href="/leave"
                    className="btn-primary inline-flex items-center justify-center gap-2 min-w-35 px-4 py-2"
                >
                    Leave Types
                </a>
                <a
                    href="/leaves"
                    className="inline-flex items-center justify-center gap-2 min-w-35 px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition duration-200 shadow-sm"
                >
                    All Leaves
                </a>
                
            </div>
            <div className="card overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Leave Types</h3>

                </div>
                <div className="overflow-x-auto">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th >Leave Type</th>
                                <th >Created Date</th>
                                <th >Max Allow Day</th>
                                <th >Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveTypes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400">
                                        No Leave Type Found
                                    </td>
                                </tr>
                            ): (
                                leaveTypes.map((type)=>{
                                    return (
                                        <tr key={type._id || type.id} >
                                            <td className="text-slate-900">
                                                {type.name}
                                            </td>
                                            <td className="text-xs text-slate-500">
                                                {format(new Date(type.createdAt), "MMM dd")}
                                            </td>
                                            <td >
                                                <span className="badge bg-slate-100 text-slate-600">
                                                    {type.maxDaysAllowed} days
                                                </span>
                                            </td>
                                            <td className="text-xs text-slate-500">
                                                <select
                                                    value={type.status}
                                                    onChange={(e) => requestStatusChange(type._id || type.id, type.status, e.target.value)}
                                                    disabled={statusUpdating === (type._id || type.id)}
                                                    className="border border-slate-200 rounded-md bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition duration-200"
                                                >
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="INACTIVE">INACTIVE</option>
                                                </select>
                                            </td>
                                            <td className="text-center">
                                                <button onClick={() => onEdit(type)} className="p-2.5 mx-1 bg-white-90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"><PencilIcon className="w-4 h-4 text-indigo-600" /></button>
                                                <button onClick={() => handleDelete(type)} className="p-2.5 mx-1 bg-white-90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"><Trash2Icon className="w-4 h-4 text-rose-600" /></button>
                                            </td>
                                            
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <LeaveHistory leaves={leaves} isAdmin={isAdmin} onUpdate={fetchLeaves} />
            <LeaveTypeModel
                open={showModel}
                initialData={editingType}
                onClose={() => { setShowModel(false); setEditingType(null); }}
                onSuccess={() => { fetchLeaves(); fetchLeaveTypes(); }}
            />
            <ConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                okText={confirmState.okText}
                loading={confirmState.loading}
                onCancel={closeConfirm}
                onConfirm={confirmAction}
            />
        
        </div>
    )
}

export default AdminLeave