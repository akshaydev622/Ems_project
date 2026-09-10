import { useCallback, useEffect, useMemo, useState } from 'react';
import Loading from '../components/Loading';
import { 
    Plus, 
    X, 
    Edit, 
    Trash2, 
    Search, 
    Filter, 
    BookOpen, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    Eye,
    FileText,
    ShieldCheck,
    RotateCcw,
    Paperclip,
    Download
} from 'lucide-react';
import { useAuth } from "../context/authcontext.jsx";
import PolicyForm from '../components/policy/PolicyForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SERVER_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const TYPE_COLORS = {
    "Code of Conduct": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Workplace & Safety": "bg-amber-50 text-amber-700 border-amber-200",
    "Leave & Attendance": "bg-sky-50 text-sky-700 border-sky-200",
    "IT & Data Security": "bg-purple-50 text-purple-700 border-purple-200",
    "Compensation & Benefits": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Remote Work & Hybrid": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Anti-Harassment & Ethics": "bg-rose-50 text-rose-700 border-rose-200",
    "General Guidelines": "bg-slate-50 text-slate-700 border-slate-200",
};

const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editPolicy, setEditPolicy] = useState(null);
    const [viewPolicy, setViewPolicy] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedYear, setSelectedYear] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const fetchPolicies = useCallback(async () => {
        try {
            const res = await api.get("/policies");
            const data = res.data.policies || res.data.data || [];
            setPolicies(data);
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            const id = deleteTarget._id || deleteTarget.id;
            await api.delete(`/policies/${id}`);
            toast.success("Policy deleted successfully");
            setDeleteTarget(null);
            fetchPolicies();
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
        } finally {
            setDeleting(false);
        }
    };

    // Extract unique years and types for filter dropdowns
    const availableYears = useMemo(() => {
        const years = new Set();
        policies.forEach((p) => {
            const yr = p.year || (p.publishedDate ? new Date(p.publishedDate).getFullYear() : null);
            if (yr) years.add(yr);
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [policies]);

    const availableTypes = useMemo(() => {
        const types = new Set();
        policies.forEach((p) => {
            if (p.type) types.add(p.type);
        });
        return Array.from(types).sort();
    }, [policies]);

    // Filtered list
    const filteredPolicies = useMemo(() => {
        return policies.filter((p) => {
            const matchesSearch =
                !searchQuery.trim() ||
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.type?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === "ALL" || p.type === selectedType;

            const policyYear = p.year || (p.publishedDate ? new Date(p.publishedDate).getFullYear() : null);
            const matchesYear = selectedYear === "ALL" || String(policyYear) === String(selectedYear);

            const policyStatus = p.status || "ACTIVE";
            const matchesStatus = selectedStatus === "ALL" || policyStatus === selectedStatus;

            return matchesSearch && matchesType && matchesYear && matchesStatus;
        });
    }, [policies, searchQuery, selectedType, selectedYear, selectedStatus]);

    // Quick stats
    const stats = useMemo(() => {
        const total = policies.length;
        const active = policies.filter((p) => (p.status || "ACTIVE") === "ACTIVE").length;
        const distinctCategories = new Set(policies.map((p) => p.type).filter(Boolean)).size;
        return { total, active, distinctCategories };
    }, [policies]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedType("ALL");
        setSelectedYear("ALL");
        setSelectedStatus("ALL");
    };

    const hasActiveFilters = searchQuery !== "" || selectedType !== "ALL" || selectedYear !== "ALL" || selectedStatus !== "ALL";

    if (loading) return <Loading />;

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="page-title">Company HR Policies</h1>
                        <p className="page-subtitle">
                            {isAdmin
                                ? "Publish, maintain and organize organization-wide policies and compliance documents"
                                : "Official employee handbook, guidelines, and company compliance documents"}
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Plus size={16} /> Add Policy
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Policies</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-0.5">{stats.total}</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Policies</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-0.5">{stats.active}</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Policy Categories</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-0.5">{stats.distinctCategories}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search policies by title, category, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-8"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Dropdowns */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <div className="w-full sm:w-44">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="ALL">All Categories</option>
                                {availableTypes.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full sm:w-32">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="ALL">All Years</option>
                                {availableYears.map((yr) => (
                                    <option key={yr} value={yr}>
                                        {yr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full sm:w-32">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="p-2.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                                title="Reset filters"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Policies Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-modern w-full">
                        <thead>
                            <tr>
                                <th className="whitespace-nowrap min-w-[220px]">Policy Title</th>
                                <th className="whitespace-nowrap">Category</th>
                                <th className="whitespace-nowrap">Effective Date</th>
                                <th className="whitespace-nowrap">Attachment</th>
                                <th className="whitespace-nowrap">Status</th>
                                <th className="whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPolicies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                                <BookOpen className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-base font-medium text-slate-700">No Policies Found</p>
                                            <p className="text-sm text-slate-400 mt-1 max-w-sm">
                                                {hasActiveFilters
                                                    ? "No policies matched your active search or filters. Try adjusting them."
                                                    : "There are no company policies uploaded yet."}
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={resetFilters}
                                                    className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPolicies.map((policy) => {
                                    const formattedDate = policy.publishedDate
                                        ? new Date(policy.publishedDate).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                          })
                                        : "-";

                                    const badgeColor =
                                        TYPE_COLORS[policy.type] || "bg-slate-50 text-slate-700 border-slate-200";
                                    const isActive = (policy.status || "ACTIVE") === "ACTIVE";
                                    const media = policy.media_id;
                                    const fileUrl = media?.filePath ? `${SERVER_BASE}${media.filePath}` : null;

                                    return (
                                        <tr key={policy._id || policy.id}>
                                            <td className="min-w-[220px] max-w-md">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-900 leading-snug">{policy.title}</p>
                                                        {policy.description && (
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                                {policy.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap shrink-0 ${badgeColor}`}
                                                >
                                                    {policy.type || "General"}
                                                </span>
                                            </td>
                                            <td className="text-slate-600 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{formattedDate}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap">
                                                {fileUrl ? (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium border border-indigo-200/80 transition-colors whitespace-nowrap"
                                                        title="Open attached document"
                                                    >
                                                        <Paperclip size={13} className="shrink-0" />
                                                        <span className="max-w-[120px] truncate">
                                                            {media.fileName || "View Doc"}
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setViewPolicy(policy)}
                                                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => setEditPolicy(policy)}
                                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                                                                title="Edit policy"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteTarget(policy)}
                                                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                                                                title="Delete policy"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Policy Modal */}
            {showCreateModal && (
                <div
                    className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-fade-in my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Add New HR Policy</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Publish a company policy for all employees</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <PolicyForm
                                initialData={null}
                                onCancel={() => setShowCreateModal(false)}
                                onSuccess={() => {
                                    setShowCreateModal(false);
                                    fetchPolicies();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Policy Modal */}
            {editPolicy && (
                <div
                    className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setEditPolicy(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Edit Policy</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Update policy details or status</p>
                            </div>
                            <button
                                onClick={() => setEditPolicy(null)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <PolicyForm
                                initialData={editPolicy}
                                onCancel={() => setEditPolicy(null)}
                                onSuccess={() => {
                                    setEditPolicy(null);
                                    fetchPolicies();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* View Policy Details Modal */}
            {viewPolicy && (
                <div
                    className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setViewPolicy(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between p-6 border-b border-slate-100">
                            <div className="pr-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                            TYPE_COLORS[viewPolicy.type] || "bg-slate-50 text-slate-700 border-slate-200"
                                        }`}
                                    >
                                        {viewPolicy.type || "General"}
                                    </span>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                            (viewPolicy.status || "ACTIVE") === "ACTIVE"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                        }`}
                                    >
                                        {viewPolicy.status || "ACTIVE"}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900">{viewPolicy.title}</h2>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    Effective Date:{" "}
                                    {viewPolicy.publishedDate
                                        ? new Date(viewPolicy.publishedDate).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          })
                                        : "Not specified"}
                                </p>
                            </div>
                            <button
                                onClick={() => setViewPolicy(null)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Attached Document Section in Modal */}
                            {viewPolicy.media_id?.filePath && (
                                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {viewPolicy.media_id.title || viewPolicy.media_id.fileName}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {viewPolicy.media_id.fileSize
                                                    ? `${(parseInt(viewPolicy.media_id.fileSize) / 1024).toFixed(1)} KB · `
                                                    : ""}
                                                Attached Policy Document
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`${SERVER_BASE}${viewPolicy.media_id.filePath}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg shrink-0"
                                    >
                                        <Download size={14} /> Open File
                                    </a>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    Policy Description & Guidelines
                                </h3>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto">
                                    {viewPolicy.description ? (
                                        viewPolicy.description
                                    ) : (
                                        <span className="text-slate-400 italic">No detailed description provided.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 pt-0">
                            <button
                                onClick={() => setViewPolicy(null)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={!!deleteTarget}
                title="Delete Policy"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                okText="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />
        </div>
    );
};

export default Policies;