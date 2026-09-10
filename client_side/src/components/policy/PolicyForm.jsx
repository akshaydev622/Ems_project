import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import api from '../../api/axios';

const POLICY_TYPES = [
    "Code of Conduct",
    "Workplace & Safety",
    "Leave & Attendance",
    "IT & Data Security",
    "Compensation & Benefits",
    "Remote Work & Hybrid",
    "Anti-Harassment & Ethics",
    "General Guidelines",
];

const PolicyForm = ({ initialData, onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;

    const [title, setTitle] = useState(initialData?.title || "");
    const [type, setType] = useState(initialData?.type || POLICY_TYPES[0]);
    const [publishedDate, setPublishedDate] = useState(
        initialData?.publishedDate
            ? new Date(initialData.publishedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [status, setStatus] = useState(initialData?.status || "ACTIVE");
    const [description, setDescription] = useState(initialData?.description || "");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Policy title is required");
            return;
        }
        if (!publishedDate) {
            toast.error("Published date is required");
            return;
        }

        try {
            setLoading(true);
            const policyId = initialData?._id || initialData?.id;

            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("type", type);
            formData.append("publishedDate", publishedDate);
            formData.append("description", description.trim());
            formData.append("status", status);
            if (file) {
                formData.append("file", file);
            }

            if (isEditMode) {
                await api.put(`/policies/${policyId}`, formData);
                toast.success("Policy updated successfully");
            } else {
                await api.post("/policies", formData);
                toast.success("Policy created successfully");
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 text-sm text-slate-700">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Policy Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Remote Work and Flexible Hours Policy"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Category / Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        >
                            {POLICY_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Published / Effective Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={publishedDate}
                            onChange={(e) => setPublishedDate(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                )}

                {/* File Upload Section */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Policy Document / Attachment (Optional)
                    </label>

                    {initialData?.media_id && !file && (
                        <div className="mb-2 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-800">
                            <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span className="truncate">
                                    Current attached file: {initialData.media_id.fileName || initialData.media_id.title}
                                </span>
                            </div>
                            <span className="text-[11px] text-indigo-500 shrink-0 ml-2 font-medium">
                                (Upload below to replace)
                            </span>
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="file"
                            id="policy-file-upload"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        {file ? (
                            <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/50">
                                <div className="flex items-center gap-2.5 truncate">
                                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <div className="truncate">
                                        <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                                        <p className="text-[11px] text-slate-500">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="policy-file-upload"
                                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-center"
                            >
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-xs font-medium text-slate-700">
                                    Click to attach policy file (PDF, Word, or Image)
                                </span>
                                <span className="text-[11px] text-slate-400 mt-0.5">
                                    Maximum file size: 15MB
                                </span>
                            </label>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Policy Description & Details
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details, scope, employee guidelines, or links regarding this policy..."
                        rows={4}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                    onClick={onCancel}
                    type="button"
                    className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    disabled={loading}
                    type="submit"
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl disabled:opacity-60"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEditMode ? "Update Policy" : "Create Policy"}
                </button>
            </div>
        </form>
    );
};

export default PolicyForm;
