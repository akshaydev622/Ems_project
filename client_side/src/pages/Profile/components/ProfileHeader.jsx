import { Building2, Hash, Briefcase, Mail, Phone, Calendar, MapPin, Pencil, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileHeader = ({ employee }) => {
    const navigate = useNavigate();

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

    return (
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
                    onClick={() => navigate("/myprofile/personal")}
                    className="relative z-10 w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-indigo-600 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                    title="Edit Profile"
                >
                    <Pencil size={14} />
                </button>
            </div>

            {/* Avatar & Header Info */}
            <div className="px-6 pb-6">
                {/* Centered Avatar */}
                <div className="flex justify-center -mt-12 mb-3 relative z-10">
                    {employee.photo ? (
                        <img
                            src={employee.photo}
                            alt={fullName}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold">
                            {initials || "?"}
                        </div>
                    )}
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
    );
};

export default ProfileHeader;
