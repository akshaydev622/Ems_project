import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
    { key: "overview",        label: "Overview",              path: "/myprofile" },
    { key: "personal",        label: "Personal Details",     path: "/myprofile/personal" },
    { key: "bank",            label: "Bank Details",         path: "/myprofile/bank" },
    { key: "parents",         label: "Parent Information",  path: "/myprofile/parents" },
    { key: "qualifications",  label: "Qualification Details",path: "/myprofile/qualifications" },
    { key: "documents",       label: "Documents",            path: "/myprofile/documents" },
];

const ProfileTabs = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Determine active tab
    const active =
        tabs.slice(1).find((t) => pathname.startsWith(t.path))?.key || "overview";

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {tabs.map((tab) => {
                    const isActive = tab.key === active;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => navigate(tab.path)}
                            className={`
                                px-4 py-2 rounded-lg text-xs transition-all duration-150 whitespace-nowrap cursor-pointer
                                ${isActive
                                    ? "bg-indigo-50 text-indigo-600 font-semibold shadow-2xs border border-indigo-100/50"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium"}
                            `}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfileTabs;
