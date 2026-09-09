import { useState, useRef } from "react";
import {
    Building2,
    Hash,
    Briefcase,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Pencil,
    MessageSquare,
    Camera,
    Upload,
    Trash2,
    Loader2,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../../components/shared/customModals/Modal";
import { uploadProfilePicture, removeProfilePicture } from "../services/myProfileApi";

const SERVER_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

const ProfileHeader = ({ employee, onSaveSuccess }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const fileInputRef = useRef(null);

    if (!employee) return null;

    const fullName = `${employee.firstName || ""} ${employee.middleName ? employee.middleName + " " : ""}${employee.lastName || ""}`.trim();
    const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const joinedDate = employee.dateOfJoining
        ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    // Resolve photo URL
    const rawPhoto = employee.photo || (employee.profilePicture?.filePath ? employee.profilePicture.filePath : null);
    const currentPhotoUrl = rawPhoto
        ? (rawPhoto.startsWith("http") || rawPhoto.startsWith("data:") ? rawPhoto : `${SERVER_BASE}${rawPhoto}`)
        : null;

    const handleOpenModal = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (uploading || removing) return;
        setIsModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file size must be less than 5 MB");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleClearSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUploadPhoto = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            await uploadProfilePicture(formData);
            toast.success("Profile picture updated successfully");
            handleCloseModal();
            onSaveSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to upload profile picture");
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        setRemoving(true);
        try {
            await removeProfilePicture();
            toast.success("Profile picture removed");
            handleCloseModal();
            onSaveSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove profile picture");
        } finally {
            setRemoving(false);
        }
    };

    const displayPhotoUrl = previewUrl || currentPhotoUrl;

    return (
        <>
            <div className="card overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                {/* Purple Banner */}
                <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 relative p-3 flex justify-end items-start">
                    <div
                        className="absolute inset-0 opacity-15"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleOpenModal}
                        className="relative z-10 w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-indigo-600 shadow-sm flex items-center justify-center transition-all cursor-pointer group"
                        title="Upload / Change Profile Picture"
                    >
                        <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Avatar & Header Info */}
                <div className="px-6 pb-6">
                    {/* Centered Avatar */}
                    <div className="flex justify-center -mt-12 mb-3 relative z-10">
                        <div className="relative group cursor-pointer" onClick={handleOpenModal}>
                            {currentPhotoUrl ? (
                                <img
                                    src={currentPhotoUrl}
                                    alt={fullName}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold">
                                    {initials || "?"}
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Camera size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{fullName || "—"}</h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{employee.position || "—"}</p>

                        {/* Role Pill Badge */}
                        <div className="flex justify-center mt-2.5 mb-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <MessageSquare size={12} />
                                {employee.role || "EMPLOYEE"}
                            </span>
                        </div>
                    </div>

                    {/* Divider & Detail items */}
                    <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{employee.email || "—"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{employee.phone || "—"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{employee.department || "—"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{employee.position || "—"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{employee.employeeCode || "—"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{joinedDate || "—"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{employee.location || employee.currentAddress || "—"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Picture Upload Modal */}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title="Update Profile Picture"
                subtitle="Upload a new photo for your employee profile"
                size="md"
                footer={
                    <div className="flex items-center justify-between gap-3 w-full">
                        {currentPhotoUrl && !selectedFile ? (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                disabled={removing || uploading}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                            >
                                {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Remove Photo
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={uploading || removing}
                                className="btn-secondary py-2 px-4 text-xs font-medium rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUploadPhoto}
                                disabled={!selectedFile || uploading || removing}
                                className="btn-primary py-2 px-4 text-xs font-medium rounded-xl flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {uploading ? "Uploading..." : "Save Photo"}
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-5 py-1">
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="relative w-32 h-32 rounded-full border-4 border-indigo-100 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                            {displayPhotoUrl ? (
                                <img src={displayPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {initials || "?"}
                                </div>
                            )}
                        </div>

                        {selectedFile && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
                                <button
                                    type="button"
                                    onClick={handleClearSelectedFile}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* File Dropzone / Selector */}
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="hidden"
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center gap-2 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800">
                                    {selectedFile ? "Change selected photo" : "Click to select a photo"}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Supports PNG, JPG, JPEG or WEBP (Max 5 MB)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ProfileHeader;
