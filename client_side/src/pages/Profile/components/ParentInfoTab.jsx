import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchParentInfo, saveParentInfo } from "../services/myProfileApi";

const INITIAL = {
    fatherName: "",
    motherName: "",
    maritalStatus: "",
    spouseName: "",
    spouseDateOfBirth: "",
    marriedDate: "",
    children: [],
};

const toDateStr = (v) => (v ? new Date(v).toISOString().split("T")[0] : "");

const ParentInfoTab = ({ onSaveSuccess }) => {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchParentInfo();
                if (data.details) {
                    setForm({
                        ...INITIAL,
                        ...data.details,
                        spouseDateOfBirth: toDateStr(data.details.spouseDateOfBirth),
                        marriedDate: toDateStr(data.details.marriedDate),
                        children: (data.details.children || []).map((c) => ({
                            ...c,
                            dateOfBirth: toDateStr(c.dateOfBirth),
                        })),
                    });
                }
            } catch {
                toast.error("Failed to load parent information");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addChild = () =>
        setForm((prev) => ({ ...prev, children: [...prev.children, { name: "", dateOfBirth: "" }] }));

    const updateChild = (i, field, value) =>
        setForm((prev) => {
            const updated = [...prev.children];
            updated[i] = { ...updated[i], [field]: value };
            return { ...prev, children: updated };
        });

    const removeChild = (i) =>
        setForm((prev) => ({ ...prev, children: prev.children.filter((_, idx) => idx !== i) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveParentInfo(form);
            toast.success("Parent information saved successfully");
            onSaveSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save parent information");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin w-6 h-6 text-indigo-500" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-6 max-w-2xl">
            {/* Parents */}
            <div className="card p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-5 pb-4 border-b border-slate-100">Parent Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                    <Field label="Father's Name">
                        <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father's full name" />
                    </Field>
                    <Field label="Mother's Name">
                        <input name="motherName" value={form.motherName} onChange={handleChange} placeholder="Mother's full name" />
                    </Field>
                </div>
            </div>

            {/* Marital Status */}
            <div className="card p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-5 pb-4 border-b border-slate-100">Marital Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                    <Field label="Marital Status">
                        <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="unmarried">Unmarried</option>
                            <option value="married">Married</option>
                            <option value="widow/widower">Widow / Widower</option>
                        </select>
                    </Field>

                    {form.maritalStatus === "married" && (
                        <>
                            <Field label="Marriage Date">
                                <input type="date" name="marriedDate" value={form.marriedDate} onChange={handleChange} />
                            </Field>
                            <Field label="Spouse Name">
                                <input name="spouseName" value={form.spouseName} onChange={handleChange} placeholder="Spouse's full name" />
                            </Field>
                            <Field label="Spouse Date of Birth">
                                <input type="date" name="spouseDateOfBirth" value={form.spouseDateOfBirth} onChange={handleChange} />
                            </Field>
                        </>
                    )}
                </div>
            </div>

            {/* Children */}
            {form.maritalStatus === "married" && (
                <div className="card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-800">Children</h3>
                        <button type="button" onClick={addChild} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                            <Plus className="w-3.5 h-3.5" /> Add Child
                        </button>
                    </div>

                    {form.children.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No children added.</p>
                    ) : (
                        <div className="space-y-3">
                            {form.children.map((child, i) => (
                                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Field label={`Child ${i + 1} Name`}>
                                        <input
                                            value={child.name}
                                            onChange={(e) => updateChild(i, "name", e.target.value)}
                                            placeholder="Full name"
                                        />
                                    </Field>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Date of Birth</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={child.dateOfBirth}
                                                onChange={(e) => updateChild(i, "dateOfBirth", e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeChild(i)}
                                                className="shrink-0 p-2 rounded-md text-rose-500 hover:bg-rose-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 min-w-36 justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Information"}
                </button>
            </div>
        </form>
    );
};

const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
        {children}
    </div>
);

export default ParentInfoTab;
