import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useMyProfile } from "./hooks/useMyProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileCompletion from "./components/ProfileCompletion";
import ProfileTabs from "./components/ProfileTabs";
import OverviewTab from "./components/OverviewTab";
import PersonalDetailsTab from "./components/PersonalDetailsTab";
import BankDetailsTab from "./components/BankDetailsTab";
import ParentInfoTab from "./components/ParentInfoTab";
import QualificationTab from "./components/QualificationTab";
import DocumentsTab from "./components/DocumentsTab";
import { Loader2, AlertCircle } from "lucide-react";

const Profile = () => {
    const { profileData, loading, error, refresh } = useMyProfile();

    // Load profile data on mount
    useEffect(() => {
        refresh();
    }, [refresh]);

    // Called after any sub-section save to refresh completion percentage
    const handleSaveSuccess = () => {
        refresh(true); // silent refresh (no loading spinner)
    };

    if (loading) {
        return (
            <div className="animate-fade-in space-y-4">
                <div className="h-4 w-40 bg-slate-200 animate-pulse rounded mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left sidebar card skeleton */}
                    <div className="lg:col-span-4 card h-96 bg-slate-50 animate-pulse rounded-2xl" />
                    {/* Right content skeleton */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="card h-40 bg-slate-50 animate-pulse rounded-2xl" />
                        <div className="h-10 bg-slate-200 animate-pulse rounded-lg w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="card h-44 bg-slate-50 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-rose-500" />
                </div>
                <p className="text-sm font-medium text-slate-600">{error}</p>
                <button onClick={() => refresh()} className="btn-primary flex items-center gap-2">
                    <Loader2 className="w-4 h-4" /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Breadcrumb */}
            <div className="mb-4">
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <span>Employee</span>
                    <span>/</span>
                    <span className="text-slate-800 font-semibold">My Profile</span>
                </p>
            </div>

            {/* Main 2-Column Side-by-Side Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Employee Profile Card */}
                <div className="lg:col-span-4 xl:col-span-4">
                    <ProfileHeader employee={profileData?.employee} onSaveSuccess={handleSaveSuccess} />
                </div>

                {/* Right Column: Completion, Tabs, and Details Content */}
                <div className="lg:col-span-8 xl:col-span-8 space-y-6">
                    {/* Profile Completion Card */}
                    <ProfileCompletion profileCompletion={profileData?.profileCompletion} />

                    {/* Navigation Tabs */}
                    <ProfileTabs />

                    {/* Tab Content via nested routes */}
                    <Routes>
                        <Route index element={<OverviewTab profileData={profileData} onRefresh={handleSaveSuccess} />} />
                        <Route path="personal" element={<PersonalDetailsTab onSaveSuccess={handleSaveSuccess} />} />
                        <Route path="bank" element={<BankDetailsTab onSaveSuccess={handleSaveSuccess} />} />
                        <Route path="parents" element={<ParentInfoTab onSaveSuccess={handleSaveSuccess} />} />
                        <Route path="qualifications" element={<QualificationTab onSaveSuccess={handleSaveSuccess} />} />
                        <Route path="documents" element={<DocumentsTab onSaveSuccess={handleSaveSuccess} />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Profile;