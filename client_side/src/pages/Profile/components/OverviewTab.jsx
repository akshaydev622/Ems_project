import { useNavigate } from "react-router-dom";
import SectionCard from "./SectionCard";
import { User, Building2, Users, GraduationCap, FileText, Info } from "lucide-react";

const formatDate = (dateVal) => {
    if (!dateVal) return "-";
    try {
        return new Date(dateVal).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
    }
};

const OverviewTab = ({ profileData }) => {
    const navigate = useNavigate();

    if (!profileData) return null;

    const { employee, personalDetails, bankDetails, parentInformation, qualification, documents } = profileData;

    // Highest qualification string check
    const highestEdu = qualification?.data?.education?.length
        ? qualification.data.education[qualification.data.education.length - 1]
        : null;

    return (
        <div className="animate-fade-in space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* 1. Personal Details */}
                <SectionCard
                    icon={User}
                    title="Personal Details"
                    completed={personalDetails?.completed}
                    iconColor="text-indigo-600"
                    onAction={() => navigate("/myprofile/personal")}
                    actionText={personalDetails?.completed ? "View / Edit Details" : "Complete Details"}
                >
                    <InfoRow label="Date of Birth" value={formatDate(employee?.dateOfBirth)} />
                    <InfoRow label="Gender" value={employee?.gender ? (employee.gender.charAt(0) + employee.gender.slice(1).toLowerCase()) : "-"} />
                    <InfoRow label="Marital Status" value={parentInformation?.data?.maritalStatus ? (parentInformation.data.maritalStatus.charAt(0).toUpperCase() + parentInformation.data.maritalStatus.slice(1)) : "-"} />
                    <InfoRow label="Nationality" value={employee?.nationality || "-"} />
                </SectionCard>

                {/* 2. Bank Details */}
                <SectionCard
                    icon={Building2}
                    title="Bank Details"
                    completed={bankDetails?.completed}
                    iconColor="text-amber-500"
                    onAction={() => navigate("/myprofile/bank")}
                    actionText={bankDetails?.completed ? "View / Edit Bank Details" : "Add Bank Details"}
                >
                    <InfoRow label="Bank Name" value={bankDetails?.data?.bankName || "-"} />
                    <InfoRow label="Account Number" value={bankDetails?.data?.accountNumber || "-"} />
                    <InfoRow label="IFSC Code" value={bankDetails?.data?.ifscCode || "-"} />
                    <InfoRow label="Account Holder Name" value={bankDetails?.data?.accountName || (employee ? `${employee.firstName} ${employee.lastName || ""}`.trim() : "-")} />
                </SectionCard>

                {/* 3. Parent Information */}
                <SectionCard
                    icon={Users}
                    title="Parent Information"
                    completed={parentInformation?.completed}
                    iconColor="text-indigo-600"
                    onAction={() => navigate("/myprofile/parents")}
                    actionText={parentInformation?.completed ? "View / Edit Details" : "Add Parent Details"}
                >
                    <InfoRow label="Father's Name" value={parentInformation?.data?.fatherName || "-"} />
                    <InfoRow label="Mother's Name" value={parentInformation?.data?.motherName || "-"} />
                    <InfoRow label="Contact Number" value={personalDetails?.data?.emergencyContactNumber || employee?.phone || "-"} />
                </SectionCard>

                {/* 4. Qualification Details */}
                <SectionCard
                    icon={GraduationCap}
                    title="Qualification Details"
                    completed={qualification?.completed}
                    iconColor="text-rose-500"
                    onAction={() => navigate("/myprofile/qualifications")}
                    actionText={qualification?.completed ? "View Qualifications" : "Add Qualification"}
                >
                    <InfoRow label="Highest Qualification" value={highestEdu?.educationLevel || highestEdu?.courseName || "-"} />
                    <InfoRow label="University / Board" value={highestEdu?.institutionName || "-"} />
                    <InfoRow label="Passing Year" value={highestEdu?.endDate ? new Date(highestEdu.endDate).getFullYear() : "-"} />
                </SectionCard>

                {/* 5. Documents */}
                <SectionCard
                    icon={FileText}
                    title="Documents"
                    completed={documents?.completed}
                    iconColor="text-violet-600"
                    onAction={() => navigate("/myprofile/documents")}
                    actionText={documents?.completed ? "Manage Documents" : "Upload Documents"}
                >
                    <InfoRow label="Documents Uploaded" value={documents?.uploaded ?? 0} />
                    <InfoRow label="Pending Documents" value={documents?.pending ?? 0} />
                </SectionCard>

                {/* 6. Important Note Card */}
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2 text-indigo-700">
                        <Info className="w-4 h-4 shrink-0 text-indigo-600" />
                        <h4 className="text-xs font-bold text-indigo-950">Important Note</h4>
                    </div>
                    <p className="text-xs text-indigo-800/80 leading-relaxed">
                        Please keep your profile information updated. This information is used for HR and payroll processes.
                    </p>
                </div>

            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-medium shrink-0">{label}</span>
        <span className="text-slate-800 font-medium text-right truncate">{value ?? "-"}</span>
    </div>
);

export default OverviewTab;
