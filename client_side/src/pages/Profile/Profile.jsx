import { useEffect, useState } from "react"
import Loading from "../../components/Loading";
import { useAuth } from "../../context/authcontext.jsx";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    BadgeCheck,
    Calendar,
    Hash,
    MapPin,
    Shield,
    ChevronRight,
} from "lucide-react";

const DetailRow = ({ icon: Icon, label, value, highlight }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mt-0.5">
            <Icon className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            {highlight ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {value || "—"}
                </span>
            ) : (
                <p className="text-sm font-medium text-slate-800 truncate">{value || "—"}</p>
            )}
        </div>
    </div>
);

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/profile");
            if (res.data) setProfile(res.data);
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    if (loading) return <Loading />;

    const fullName = profile
        ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
        : user?.name || "Employee";

    const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const joinedDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    return (
        <div className="animate-fade-in">
            {/* ── TOP SECTION: Two-column hero ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

                {/* LEFT — Profile Card */}
                <div className="lg:col-span-1">
                    <div className="card relative overflow-hidden h-full">
                        {/* Decorative gradient banner */}
                        <div className="h-14 bg-linear-to-r from-indigo-500 via-indigo-600 to-violet-600 relative">
                            <div className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                                    backgroundSize: "30px 30px"
                                }}
                            />
                        </div>

                        <div className="px-6 pb-6">
                            {/* Avatar */}
                            <div className="flex justify-center -mt-14 mb-4 relative z-10">
                                {profile?.photo ? (
                                    <img
                                        src={profile.photo}
                                        alt={fullName}
                                        className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-xl"
                                    />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 ring-4 ring-white shadow-xl flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{initials}</span>
                                    </div>
                                )}
                            </div>

                            {/* Name & role */}
                            <div className="text-center mb-5">
                                <h2 className="text-xl font-semibold text-slate-900 mb-1">{fullName}</h2>
                                <p className="text-sm text-slate-500 mb-3">
                                    {profile?.position || profile?.jobProfile || "—"}
                                </p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/15">
                                    <Shield className="w-3 h-3" />
                                    {profile?.role || user?.role || "Employee"}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-100 mb-4" />

                            {/* Quick contact info */}
                            <div className="space-y-3">
                                {profile?.email && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="truncate">{profile.email}</span>
                                    </div>
                                )}
                                {profile?.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                                {profile?.department && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span>{profile.department}</span>
                                    </div>
                                )}
                                {profile?.location && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Employee Details Card */}
                <div className="lg:col-span-2">
                    <div className="card h-full">
                        <div className="p-6">
                            {/* Card title */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <BadgeCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">Employee Details</h3>
                                    <p className="text-xs text-slate-400">Official employment information</p>
                                </div>
                            </div>

                            {/* Details grid — 2 columns on medium+ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                <div>
                                    <DetailRow
                                        icon={Hash}
                                        label="Employee Code"
                                        value={profile?.employeeCode || profile?.employeeId}
                                    />
                                    <DetailRow
                                        icon={Shield}
                                        label="Role"
                                        value={profile?.role || user?.role}
                                    />
                                    <DetailRow
                                        icon={Briefcase}
                                        label="Job Profile"
                                        value={profile?.jobProfile || profile?.position}
                                    />
                                    <DetailRow
                                        icon={Building2}
                                        label="Department"
                                        value={profile?.department}
                                    />
                                </div>
                                <div>
                                    <DetailRow
                                        icon={User}
                                        label="Employment Type"
                                        value={profile?.employmentType}
                                    />
                                    <DetailRow
                                        icon={BadgeCheck}
                                        label="Status"
                                        value={profile?.employeeStatus}
                                        highlight={profile?.employeeStatus === "ACTIVE"}
                                    />
                                    <DetailRow
                                        icon={Calendar}
                                        label="Date of Joining"
                                        value={joinedDate}
                                    />
                                    <DetailRow
                                        icon={MapPin}
                                        label="Work Location"
                                        value={profile?.location || profile?.workLocation}
                                    />
                                </div>
                            </div>

                            {/* Description / bio if any */}
                            {profile?.description && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">About</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{profile.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PLACEHOLDER for ahead sections ── */}
            {/* More sections (e.g. Leave summary, Attendance, Documents) will go here */}
        </div>
    );
};

export default Profile;