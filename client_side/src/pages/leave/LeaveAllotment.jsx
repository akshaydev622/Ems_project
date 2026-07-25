import { useCallback, useEffect, useState } from 'react'
import { PlusIcon, EyeIcon, Trash2Icon } from 'lucide-react'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { format } from 'date-fns'
import BulkAllotmentModel from '../../components/leave/BulkAllotmentModel'
import IndividualAllotmentModel from '../../components/leave/IndividualAllotmentModel'
import AllotmentTypeSelector from '../../components/leave/AllotmentTypeSelector'
import ConfirmModal from '../../components/ConfirmModal'

const LeaveAllotment = () => {
    const [leaveAllotments, setLeaveAllotments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAllotmentTypeSelector, setShowAllotmentTypeSelector] = useState(false)
    const [showBulkAllotment, setShowBulkAllotment] = useState(false)
    const [showIndividualAllotment, setShowIndividualAllotment] = useState(false)
    const [editingType, setEditingType] = useState(null)
    const [statusUpdating, setStatusUpdating] = useState('')
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: 'Confirm Action',
        message: '',
        okText: 'Yes',
        loading: false,
        onConfirm: null,
    })

    const fetchAllotments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leave-allotment/leave-balance-summary');
            setLeaveAllotments(response.data.data);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to fetch leave allotments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllotments();
    }, []);

    const handleStatusUpdate = async (typeId, newStatus) => {

    }

    const handleSelectBulkAllotment = () => {
        setShowAllotmentTypeSelector(false)
        setShowBulkAllotment(true)
    }

    const handleSelectIndividualAllotment = () => {
        setShowAllotmentTypeSelector(false)
        setShowIndividualAllotment(true)
    }

    const requestStatusChange = (typeId, currentStatus, newStatus) => {
        if (currentStatus === newStatus) return

        setConfirmState({
            open: true,
            title: 'Confirm Status Change',
            message: `Change leave type status from ${currentStatus} to ${newStatus}?`,
            okText: newStatus === 'INACTIVE' ? 'Delete' : 'Yes',
            loading: false,
            onConfirm: () => handleStatusUpdate(typeId, newStatus),
        })
    }

    const onViewDetails = (allotment) => {
        toast.success(`Viewing Details for Allotment ${allotment._id} (To be implemented)`)
    }

    const handleDelete = (type) => {
        setConfirmState({
            open: true,
            title: 'Confirm Delete',
            message: `Are you sure you want to delete ${type.name}?`,
            okText: 'Delete',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmState((prev) => ({ ...prev, loading: true }))
                    const typeId = type._id || type.id
                    // Mock delete logic
                    // await api.delete(`/leave-allotment/${typeId}`)
                    setLeaveAllotments(prev => prev.filter(a => a._id !== typeId))
                    toast.success('Leave allotment deleted successfully')

                } catch (error) {
                    toast.error(error.response?.data?.error || error.message)
                } finally {
                    setConfirmState((prev) => ({ ...prev, open: false, loading: false }))
                }
            },
        })
    }

    const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false, loading: false }))
    const confirmAction = async () => {
        if (confirmState.onConfirm) await confirmState.onConfirm()
    }

    if (loading) return <Loading />

    return (
        <div className="animate-fade-in">
            <div className="card overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Leave Allotment</h3>
                        <p className="text-sm text-slate-500 mt-1">Manage leave Allotment and configure their status.</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowAllotmentTypeSelector(true)
                        }}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" /> New Leave Allotment
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table-modern w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Year</th>
                                <th className="px-6 py-4">CL</th>
                                <th className="px-6 py-4">SL</th>
                                <th className="px-6 py-4">BL</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaveAllotments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-400">
                                        No Leave Allotments Found
                                    </td>
                                </tr>
                            ) : (
                                leaveAllotments.map((employee) => (
                                    <tr key={`${employee.employeeId}-${employee.year}`} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            {employee.employeeName}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{employee.year}</td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const bal = employee.leaveBalances?.find(b => b.code === 'CL');
                                                return bal ? (
                                                    <div className="text-sm">
                                                        <span className="text-emerald-600 font-medium">{bal.remaining}</span>
                                                        <span className="text-slate-400 text-xs ml-1">/ {bal.allocated}</span>
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const bal = employee.leaveBalances?.find(b => b.code === 'SL');
                                                return bal ? (
                                                    <div className="text-sm">
                                                        <span className="text-emerald-600 font-medium">{bal.remaining}</span>
                                                        <span className="text-slate-400 text-xs ml-1">/ {bal.allocated}</span>
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const bal = employee.leaveBalances?.find(b => b.code === 'BL');
                                                return bal ? (
                                                    <div className="text-sm">
                                                        <span className="text-emerald-600 font-medium">{bal.remaining}</span>
                                                        <span className="text-slate-400 text-xs ml-1">/ {bal.allocated}</span>
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => onViewDetails(employee)}
                                                className="p-2 mx-1 bg-white text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50"
                                                title="View Details"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <AllotmentTypeSelector
                open={showAllotmentTypeSelector}
                onClose={() => setShowAllotmentTypeSelector(false)}
                onSelectBulk={handleSelectBulkAllotment}
                onSelectIndividual={handleSelectIndividualAllotment}
            />

            <BulkAllotmentModel
                open={showBulkAllotment}
                onClose={() => {
                    setShowBulkAllotment(false);
                    fetchAllotments();
                }}
            />

            <IndividualAllotmentModel
                open={showIndividualAllotment}
                onClose={() => {
                    setShowIndividualAllotment(false);
                    fetchAllotments();
                }}
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


export default LeaveAllotment