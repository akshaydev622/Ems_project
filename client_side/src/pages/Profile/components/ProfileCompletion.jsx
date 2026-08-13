import { ChevronRight, Building2, User, Users, GraduationCap, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SECTION_ICONS = {
    personalDetails: User,
    bankDetails: Building2,
    parentInformation: Users,
    qualification: GraduationCap,
    documents: FileText,
};

const SECTION_PATHS = {
    personalDetails: "/myprofile/personal",
    bankDetails: "/myprofile/bank",
    parentInformation: "/myprofile/parents",
    qualification: "/myprofile/qualifications",
    documents: "/myprofile/documents",
};

const ProfileCompletion = ({ profileCompletion }) => {
    const navigate = useNavigate();

    if (!profileCompletion) return null;

    const { percentage, completed, total, sections } = profileCompletion;
    const pendingSections = sections?.filter((s) => !s.completed) || [];
    const nextSection = pendingSections[0];

    const NextIcon = nextSection ? (SECTION_ICONS[nextSection.key] || Building2) : Building2;
    const nextPath = nextSection ? (SECTION_PATHS[nextSection.key] || "/myprofile") : "/myprofile";

    return (
        <div className="card bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Profile Completion</h3>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                {/* Left Progress Ring */}
                <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r="38" strokeWidth="8" stroke="#f1f5f9" fill="none" />
                        <circle
                            cx="45" cy="45" r="38" strokeWidth="8"
                            stroke="#6366f1" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 38}`}
                            strokeDashoffset={`${2 * Math.PI * 38 * (1 - percentage / 100)}`}
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-extrabold text-slate-900 leading-none">{percentage}%</span>
                        <span className="text-[10px] font-medium text-slate-400 mt-0.5">Completed</span>
                    </div>
                </div>

                {/* Middle Text & Progress Bar */}
                <div className="flex-1 max-w-lg">
                    <h4 className="text-sm font-bold text-slate-900">
                        Great! Your profile is {percentage}% complete.
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                        Complete your remaining details to keep your profile up to date.
                    </p>

                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    <p className="text-[11px] font-medium text-slate-400">
                        {completed} of {total} sections completed
                    </p>
                </div>

                {/* Right Next to Complete Box */}
                {nextSection && (
                    <div className="shrink-0 w-full md:w-auto">
                        <p className="text-[11px] font-medium text-slate-400 mb-1.5">Next to complete</p>
                        <div
                            onClick={() => navigate(nextPath)}
                            className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs rounded-xl transition cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <NextIcon size={16} />
                            </div>
                            <span className="text-xs font-semibold text-slate-800">{nextSection.label}</span>
                            <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCompletion;
