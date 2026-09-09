import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';

const HolidayForm = ({ initialData, onCancel, onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            setLoading(true);
            const holidayId = initialData?._id || initialData?.id;
            const url = isEditMode ? `/holidays/${holidayId}` : "/holidays";
            const method = isEditMode ? "put" : "post";
            await api[method](url, formData);
            toast.success(isEditMode ? "Holiday updated successfully" : "Holiday created successfully");
            if (onSuccess) {
                onSuccess();
            } else {
                navigate("/holidays");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    const initialDate = initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Holiday Name
                    </label>
                    <input
                        type="text"
                        name="holidayName"
                        placeholder="Enter holiday name"
                        defaultValue={initialData?.holidayName || initialData?.name || ""}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        placeholder="Enter date"
                        defaultValue={initialDate}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Type
                    </label>
                    <select name="type" defaultValue={initialData?.type || "Fixed Holiday"}>
                        <option value="Fixed Holiday">Fixed Holiday</option>
                        <option value="National Holiday">National Holiday</option>
                        <option value="Other Holiday">Other Holiday</option>
                    </select>
                </div>
                {isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                        <select name="status" defaultValue={initialData?.status || "ACTIVE"}>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    placeholder="Write a brief description about this holiday"
                    className="resize-none"
                    rows={4}
                    defaultValue={initialData?.description || ""}
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={() => (onCancel ? onCancel() : navigate(-1))}
                    type="button"
                    className="btn-secondary"
                >
                    Cancel
                </button>
                <button disabled={loading} type="submit" className="btn-primary flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEditMode ? "Update holiday" : "Create holiday"}
                </button>
            </div>
        </form>
    );
};

export default HolidayForm;