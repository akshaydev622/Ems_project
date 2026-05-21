import { useEffect, useState } from 'react'
import { CalendarDays, FileText, Loader2, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const LeaveTypeModel = ({ open, onClose, onSuccess, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        name: '',
        maxDaysAllowed: '',
        status: 'ACTIVE',
    });

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isEditMode) {
            setValues({
                name: initialData.name || '',
                maxDaysAllowed: initialData.maxDaysAllowed || '',
                status: initialData.status || 'ACTIVE',
            });
        } else {
            setValues({ name: '', maxDaysAllowed: '', status: 'ACTIVE' });
        }
    }, [initialData, isEditMode, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                maxDaysAllowed: Number(values.maxDaysAllowed),
                status: values.status,
            };

            if (isEditMode) {
                const typeId = initialData._id || initialData.id;
                await api.put(`/leave-types/${typeId}`, payload);
                toast.success('Leave type updated successfully');
            } else {
                await api.post('/leave-types', payload);
                toast.success('Leave type created successfully');
            }
            onSuccess?.();
            onClose?.();
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    if(!open) return null;

  return (
    <div className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 animate-fade-in" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-0">
        <div>
            <h2 className="text-lg font-semibold text-slate-900">{isEditMode ? 'Update Leave Type' : 'Add Leave Type'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isEditMode ? 'Update the selected leave type details.' : 'Add a new leave type to the system'}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 ">
            <X className="w-5 h-5" />
        </button>
        </div>
        {/* form */}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-slate-400"/>
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    required
                    className="border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />Maximum Days Allowed
                </label>
                <input
                    type="number"
                    min="0"
                    name="maxDaysAllowed"
                    value={values.maxDaysAllowed}
                    onChange={handleChange}
                    required
                    className="border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    className="border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                </select>
            </div>
            <div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} type="button" className="btn-secondary flex-1" >
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading} >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Leave Type' : 'Add Leave Type')}
                    </button>
                </div>
            </div>
        </form>
        
    </div>
    </div>

  )
}

export default LeaveTypeModel