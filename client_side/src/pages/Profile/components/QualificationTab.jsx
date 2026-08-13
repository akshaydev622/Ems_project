import { useState, useEffect } from "react";
import { Plus, Loader2, Pencil, Trash2, GraduationCap, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../../components/shared/customModals/Modal";
import ConfirmModal from "../../../components/ConfirmModal";
import {
    fetchQualifications,
    addEducation, updateEducation, deleteEducation,
    addExperience, updateExperience, deleteExperience,
} from "../services/myProfileApi";

const EDUCATION_LEVELS = ["10th", "12th", "Diploma", "Graduation", "Post Graduation", "PhD", "Other"];

const EDU_INIT = { educationLevel: "", institutionName: "", courseName: "", startDate: "", endDate: "", percentage: "", cgpa: "", gpa: "", remarks: "" };
const EXP_INIT = { organizationName: "", organizationType: "", startDate: "", endDate: "", totalExperience: "", responsibilities: "" };

const toDate = (v) => (v ? new Date(v).toISOString().split("T")[0] : "");

const QualificationTab = ({ onSaveSuccess }) => {
    const [qualData, setQualData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Education modal state
    const [eduModal, setEduModal] = useState(false);
    const [eduForm, setEduForm] = useState(EDU_INIT);
    const [editingEduId, setEditingEduId] = useState(null);
    const [savingEdu, setSavingEdu] = useState(false);
    const [deleteEduConfirm, setDeleteEduConfirm] = useState(null);
    const [deletingEdu, setDeletingEdu] = useState(false);

    // Experience modal state
    const [expModal, setExpModal] = useState(false);
    const [expForm, setExpForm] = useState(EXP_INIT);
    const [editingExpId, setEditingExpId] = useState(null);
    const [savingExp, setSavingExp] = useState(false);
    const [deleteExpConfirm, setDeleteExpConfirm] = useState(null);
    const [deletingExp, setDeletingExp] = useState(false);

    const load = async () => {
        try {
            const { data } = await fetchQualifications();
            setQualData(data.details);
        } catch {
            toast.error("Failed to load qualifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // ── Education handlers ───────────────────────────────────────────────────
    const openAddEdu = () => { setEduForm(EDU_INIT); setEditingEduId(null); setEduModal(true); };
    const openEditEdu = (edu) => {
        setEduForm({ ...edu, startDate: toDate(edu.startDate), endDate: toDate(edu.endDate), percentage: edu.percentage || "", cgpa: edu.cgpa || "", gpa: edu.gpa || "" });
        setEditingEduId(edu._id);
        setEduModal(true);
    };

    const handleEduSubmit = async (e) => {
        e.preventDefault();
        setSavingEdu(true);
        try {
            if (editingEduId) {
                await updateEducation(editingEduId, eduForm);
            } else {
                await addEducation(eduForm);
            }
            toast.success(editingEduId ? "Education updated" : "Education added");
            setEduModal(false);
            onSaveSuccess?.();
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save education");
        } finally {
            setSavingEdu(false);
        }
    };

    const handleDeleteEdu = async () => {
        setDeletingEdu(true);
        try {
            await deleteEducation(deleteEduConfirm);
            toast.success("Education record deleted");
            setDeleteEduConfirm(null);
            onSaveSuccess?.();
            await load();
        } catch {
            toast.error("Failed to delete education");
        } finally {
            setDeletingEdu(false);
        }
    };

    // ── Experience handlers ──────────────────────────────────────────────────
    const openAddExp = () => { setExpForm(EXP_INIT); setEditingExpId(null); setExpModal(true); };
    const openEditExp = (exp) => {
        setExpForm({ ...exp, startDate: toDate(exp.startDate), endDate: toDate(exp.endDate) });
        setEditingExpId(exp._id);
        setExpModal(true);
    };

    const handleExpSubmit = async (e) => {
        e.preventDefault();
        setSavingExp(true);
        try {
            if (editingExpId) {
                await updateExperience(editingExpId, expForm);
            } else {
                await addExperience(expForm);
            }
            toast.success(editingExpId ? "Experience updated" : "Experience added");
            setExpModal(false);
            onSaveSuccess?.();
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save experience");
        } finally {
            setSavingExp(false);
        }
    };

    const handleDeleteExp = async () => {
        setDeletingExp(true);
        try {
            await deleteExperience(deleteExpConfirm);
            toast.success("Experience record deleted");
            setDeleteExpConfirm(null);
            onSaveSuccess?.();
            await load();
        } catch {
            toast.error("Failed to delete experience");
        } finally {
            setDeletingExp(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-6 h-6 text-indigo-500" /></div>;

    const education = qualData?.education || [];
    const experience = qualData?.experience || [];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Education */}
            <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4.5 h-4.5 text-indigo-500" />
                        <h3 className="text-sm font-semibold text-slate-800">Education</h3>
                        {education.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">{education.length}</span>
                        )}
                    </div>
                    <button type="button" onClick={openAddEdu} className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs">
                        <Plus className="w-3.5 h-3.5" /> Add Education
                    </button>
                </div>

                {education.length === 0 ? (
                    <EmptyState icon={GraduationCap} text="No education records added yet." onAdd={openAddEdu} addText="Add Education" />
                ) : (
                    <div className="space-y-3">
                        {education.map((edu) => (
                            <div key={edu._id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{edu.educationLevel}</p>
                                            <p className="text-xs text-slate-500">{edu.courseName} — {edu.institutionName}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {toDate(edu.startDate)} → {toDate(edu.endDate)}
                                                {edu.percentage ? ` · ${edu.percentage}%` : ""}
                                                {edu.cgpa ? ` · CGPA: ${edu.cgpa}` : ""}
                                            </p>
                                            {edu.remarks && <p className="text-xs text-slate-400 mt-0.5 italic">{edu.remarks}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => openEditEdu(edu)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setDeleteEduConfirm(edu._id)} className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Experience */}
            <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4.5 h-4.5 text-violet-500" />
                        <h3 className="text-sm font-semibold text-slate-800">Work Experience</h3>
                        {experience.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">{experience.length}</span>
                        )}
                    </div>
                    <button type="button" onClick={openAddExp} className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Experience
                    </button>
                </div>

                {experience.length === 0 ? (
                    <EmptyState icon={Briefcase} text="No work experience records added yet." onAdd={openAddExp} addText="Add Experience" />
                ) : (
                    <div className="space-y-3">
                        {experience.map((exp) => (
                            <div key={exp._id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-4 h-4 text-violet-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{exp.organizationName}</p>
                                            <p className="text-xs text-slate-500">{exp.organizationType} · {exp.totalExperience}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{toDate(exp.startDate)} → {toDate(exp.endDate)}</p>
                                            {exp.responsibilities && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exp.responsibilities}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => openEditExp(exp)} className="p-1.5 rounded-md hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setDeleteExpConfirm(exp._id)} className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Education Modal */}
            <Modal open={eduModal} onClose={() => setEduModal(false)} title={editingEduId ? "Edit Education" : "Add Education"} size="lg"
                footer={
                    <div className="flex gap-3">
                        <button type="button" className="btn-secondary flex-1" onClick={() => setEduModal(false)}>Cancel</button>
                        <button type="submit" form="edu-form" disabled={savingEdu} className="btn-primary flex-1 flex justify-center items-center gap-2">
                            {savingEdu && <Loader2 className="w-4 h-4 animate-spin" />}
                            {savingEdu ? "Saving..." : "Save"}
                        </button>
                    </div>
                }
            >
                <form id="edu-form" onSubmit={handleEduSubmit} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Education Level" required>
                            <select value={eduForm.educationLevel} onChange={(e) => setEduForm((p) => ({ ...p, educationLevel: e.target.value }))} required>
                                <option value="">Select level</option>
                                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Course / Stream" required>
                            <input value={eduForm.courseName} onChange={(e) => setEduForm((p) => ({ ...p, courseName: e.target.value }))} placeholder="B.Tech, B.Sc, etc." required />
                        </FormField>
                        <FormField label="Institution / University" required className="sm:col-span-2">
                            <input value={eduForm.institutionName} onChange={(e) => setEduForm((p) => ({ ...p, institutionName: e.target.value }))} placeholder="Institution name" required />
                        </FormField>
                        <FormField label="Start Date" required>
                            <input type="date" value={eduForm.startDate} onChange={(e) => setEduForm((p) => ({ ...p, startDate: e.target.value }))} required />
                        </FormField>
                        <FormField label="End Date / Passing Year" required>
                            <input type="date" value={eduForm.endDate} onChange={(e) => setEduForm((p) => ({ ...p, endDate: e.target.value }))} required />
                        </FormField>
                        <FormField label="Percentage (%)">
                            <input type="number" min="0" max="100" value={eduForm.percentage} onChange={(e) => setEduForm((p) => ({ ...p, percentage: e.target.value }))} placeholder="0" />
                        </FormField>
                        <FormField label="CGPA">
                            <input type="number" step="0.01" min="0" max="10" value={eduForm.cgpa} onChange={(e) => setEduForm((p) => ({ ...p, cgpa: e.target.value }))} placeholder="0.00" />
                        </FormField>
                        <FormField label="Remarks" className="sm:col-span-2">
                            <input value={eduForm.remarks} onChange={(e) => setEduForm((p) => ({ ...p, remarks: e.target.value }))} placeholder="Optional remarks" />
                        </FormField>
                    </div>
                </form>
            </Modal>

            {/* Experience Modal */}
            <Modal open={expModal} onClose={() => setExpModal(false)} title={editingExpId ? "Edit Experience" : "Add Experience"} size="lg"
                footer={
                    <div className="flex gap-3">
                        <button type="button" className="btn-secondary flex-1" onClick={() => setExpModal(false)}>Cancel</button>
                        <button type="submit" form="exp-form" disabled={savingExp} className="btn-primary flex-1 flex justify-center items-center gap-2">
                            {savingExp && <Loader2 className="w-4 h-4 animate-spin" />}
                            {savingExp ? "Saving..." : "Save"}
                        </button>
                    </div>
                }
            >
                <form id="exp-form" onSubmit={handleExpSubmit} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Organization Name" required className="sm:col-span-2">
                            <input value={expForm.organizationName} onChange={(e) => setExpForm((p) => ({ ...p, organizationName: e.target.value }))} placeholder="Company name" required />
                        </FormField>
                        <FormField label="Organization Type" required>
                            <input value={expForm.organizationType} onChange={(e) => setExpForm((p) => ({ ...p, organizationType: e.target.value }))} placeholder="IT, Healthcare, etc." required />
                        </FormField>
                        <FormField label="Total Experience" required>
                            <input value={expForm.totalExperience} onChange={(e) => setExpForm((p) => ({ ...p, totalExperience: e.target.value }))} placeholder="e.g. 2 years 3 months" required />
                        </FormField>
                        <FormField label="Start Date" required>
                            <input type="date" value={expForm.startDate} onChange={(e) => setExpForm((p) => ({ ...p, startDate: e.target.value }))} required />
                        </FormField>
                        <FormField label="End Date" required>
                            <input type="date" value={expForm.endDate} onChange={(e) => setExpForm((p) => ({ ...p, endDate: e.target.value }))} required />
                        </FormField>
                        <FormField label="Responsibilities" required className="sm:col-span-2">
                            <textarea value={expForm.responsibilities} onChange={(e) => setExpForm((p) => ({ ...p, responsibilities: e.target.value }))} rows={3} className="resize-none" placeholder="Describe your responsibilities" required />
                        </FormField>
                    </div>
                </form>
            </Modal>

            {/* Delete Education Confirm */}
            <ConfirmModal
                open={!!deleteEduConfirm}
                title="Delete Education Record"
                message="Are you sure you want to delete this education record? This action cannot be undone."
                okText="Delete"
                loading={deletingEdu}
                onConfirm={handleDeleteEdu}
                onCancel={() => setDeleteEduConfirm(null)}
            />

            {/* Delete Experience Confirm */}
            <ConfirmModal
                open={!!deleteExpConfirm}
                title="Delete Experience Record"
                message="Are you sure you want to delete this work experience record? This action cannot be undone."
                okText="Delete"
                loading={deletingExp}
                onConfirm={handleDeleteExp}
                onCancel={() => setDeleteExpConfirm(null)}
            />
        </div>
    );
};

const EmptyState = ({ icon: Icon, text, onAdd, addText }) => (
    <div className="flex flex-col items-center gap-3 py-10">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-400">{text}</p>
        <button type="button" onClick={onAdd} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            <Plus className="w-3.5 h-3.5" /> {addText}
        </button>
    </div>
);

const FormField = ({ label, required, children, className = "" }) => (
    <div className={className}>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">{label} {required && <span className="text-rose-500">*</span>}</label>
        {children}
    </div>
);

export default QualificationTab;
