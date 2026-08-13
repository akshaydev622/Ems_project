import { useState, useEffect, useRef } from "react";
import { Loader2, Upload, Trash2, FileText, Image, File, Download, Plus } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../../components/ConfirmModal";
import { fetchDocuments, uploadDocument, deleteDocument } from "../services/myProfileApi";

const SERVER_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const FILE_ICONS = {
    "application/pdf": FileText,
    "image/jpeg": Image,
    "image/jpg": Image,
    "image/png": Image,
    default: File,
};

const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const n = parseInt(bytes);
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const DocumentsTab = ({ onSaveSuccess }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [docName, setDocName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileRef = useRef(null);

    const load = async () => {
        try {
            const { data } = await fetchDocuments();
            setDocuments(data.documents || []);
        } catch {
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        if (!docName) setDocName(file.name.replace(/\.[^.]+$/, ""));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) { toast.error("Please select a file"); return; }
        if (!docName.trim()) { toast.error("Please enter a document name"); return; }

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", selectedFile);
            fd.append("documentName", docName.trim());
            await uploadDocument(fd);
            toast.success("Document uploaded successfully");
            setSelectedFile(null);
            setDocName("");
            if (fileRef.current) fileRef.current.value = "";
            onSaveSuccess?.();
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeletingId(deleteConfirm);
        try {
            await deleteDocument(deleteConfirm);
            toast.success("Document deleted");
            setDeleteConfirm(null);
            onSaveSuccess?.();
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete document");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-6 h-6 text-indigo-500" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            {/* Upload Form */}
            <div className="card p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-5 pb-4 border-b border-slate-100">Upload New Document</h3>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Document Name <span className="text-rose-500">*</span></label>
                            <input
                                value={docName}
                                onChange={(e) => setDocName(e.target.value)}
                                placeholder="e.g. Aadhaar Card, PAN Card"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Select File <span className="text-rose-500">*</span></label>
                            <input
                                type="file"
                                ref={fileRef}
                                onChange={handleFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="cursor-pointer"
                                required
                            />
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-indigo-800 truncate">{selectedFile.name}</p>
                                <p className="text-[11px] text-indigo-500">{formatFileSize(selectedFile.size)}</p>
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-slate-400">
                        Allowed: PDF, JPG, PNG, Word documents · Max size: 10 MB
                    </div>

                    <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Uploading..." : "Upload Document"}
                    </button>
                </form>
            </div>

            {/* Documents List */}
            <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800">My Documents</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{documents.length} uploaded</span>
                </div>

                {documents.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-10">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            <Plus className="w-3.5 h-3.5" /> Upload your first document
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const media = doc.documentId;
                            const IconComp = FILE_ICONS[media?.fileType] || FILE_ICONS.default;
                            const uploadedDate = new Date(doc.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                            });
                            const fileUrl = media?.filePath ? `${SERVER_BASE}${media.filePath}` : null;

                            return (
                                <div key={doc._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                        <IconComp className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{doc.documentName}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                            <span className="text-xs text-slate-400">Uploaded {uploadedDate}</span>
                                            {media?.fileSize && (
                                                <span className="text-xs text-slate-400">· {formatFileSize(media.fileSize)}</span>
                                            )}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ring-1 ${
                                                doc.documentStatus === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                    : "bg-slate-100 text-slate-500 ring-slate-200"
                                            }`}>
                                                {doc.documentStatus}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {fileUrl && (
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                                title="View / Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setDeleteConfirm(doc._id)}
                                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={!!deleteConfirm}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
                okText="Delete"
                loading={deletingId === deleteConfirm}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </div>
    );
};

export default DocumentsTab;
