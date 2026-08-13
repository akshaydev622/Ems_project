import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { fetchPersonalDetails, savePersonalDetails } from "../services/myProfileApi";

const INITIAL = {
    pancardNumber: "",
    aadharcardNumber: "",
    passportNumber: "",
    passportExpiryDate: "",
    drivingLicenceNumber: "",
    drivingLicenceExpiryDate: "",
    secondaryEmail: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    relation: "",
    currentAddress: "",
    currentCountry: "",
    currentState: "",
    currentDistrict: "",
    currentPincode: "",
    permanentAddress: "",
    permanentCountry: "",
    permanentState: "",
    permanentDistrict: "",
    permanentPincode: "",
};

const toDateStr = (v) => (v ? new Date(v).toISOString().split("T")[0] : "");

const PersonalDetailsTab = ({ onSaveSuccess }) => {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sameAddress, setSameAddress] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await fetchPersonalDetails();
            if (data.details) {
                setForm({
                    ...INITIAL,
                    ...data.details,
                    passportExpiryDate: toDateStr(data.details.passportExpiryDate),
                    drivingLicenceExpiryDate: toDateStr(data.details.drivingLicenceExpiryDate),
                });
            } else {
                setForm(INITIAL);
            }
        } catch {
            toast.error("Failed to load personal details");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSameAddress = (e) => {
        setSameAddress(e.target.checked);
        if (e.target.checked) {
            setForm((prev) => ({
                ...prev,
                permanentAddress: prev.currentAddress,
                permanentCountry: prev.currentCountry,
                permanentState: prev.currentState,
                permanentDistrict: prev.currentDistrict,
                permanentPincode: prev.currentPincode,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await savePersonalDetails(form);
            toast.success("Personal details saved successfully");
            onSaveSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save personal details");
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
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
            {/* Identity Documents */}
            <Section title="Identity Documents">
                <Field label="PAN Card Number">
                    <input name="pancardNumber" value={form.pancardNumber} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} />
                </Field>
                <Field label="Aadhaar Card Number">
                    <input name="aadharcardNumber" value={form.aadharcardNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX" maxLength={14} />
                </Field>
                <Field label="Passport Number">
                    <input name="passportNumber" value={form.passportNumber} onChange={handleChange} placeholder="A1234567" />
                </Field>
                <Field label="Passport Expiry Date">
                    <input type="date" name="passportExpiryDate" value={form.passportExpiryDate} onChange={handleChange} />
                </Field>
                <Field label="Driving Licence Number">
                    <input name="drivingLicenceNumber" value={form.drivingLicenceNumber} onChange={handleChange} placeholder="DL-XXXXXXXXXX" />
                </Field>
                <Field label="Driving Licence Expiry">
                    <input type="date" name="drivingLicenceExpiryDate" value={form.drivingLicenceExpiryDate} onChange={handleChange} />
                </Field>
            </Section>

            {/* Contact Information */}
            <Section title="Contact Information">
                <Field label="Personal / Secondary Email">
                    <input type="email" name="secondaryEmail" value={form.secondaryEmail} onChange={handleChange} placeholder="personal@example.com" />
                </Field>
                <Field label="Emergency Contact Name" required>
                    <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Full Name" />
                </Field>
                <Field label="Emergency Contact Number" required>
                    <input name="emergencyContactNumber" value={form.emergencyContactNumber} onChange={handleChange} placeholder="+91 XXXXXXXXXX" />
                </Field>
                <Field label="Relation with Emergency Contact">
                    <select name="relation" value={form.relation} onChange={handleChange}>
                        <option value="">Select relation</option>
                        {["Father", "Mother", "Spouse", "Sibling", "Friend", "Other"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </Field>
            </Section>

            {/* Current Address */}
            <Section title="Current Address">
                <Field label="Address" className="sm:col-span-2">
                    <textarea name="currentAddress" value={form.currentAddress} onChange={handleChange} rows={2} className="resize-none" placeholder="Street, Area" />
                </Field>
                <Field label="District">
                    <input name="currentDistrict" value={form.currentDistrict} onChange={handleChange} placeholder="District" />
                </Field>
                <Field label="State">
                    <input name="currentState" value={form.currentState} onChange={handleChange} placeholder="State" />
                </Field>
                <Field label="Country">
                    <input name="currentCountry" value={form.currentCountry} onChange={handleChange} placeholder="Country" />
                </Field>
                <Field label="PIN Code">
                    <input name="currentPincode" value={form.currentPincode} onChange={handleChange} placeholder="400001" maxLength={10} />
                </Field>
            </Section>

            {/* Permanent Address */}
            <Section title="Permanent Address" headerRight={
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input type="checkbox" checked={sameAddress} onChange={handleSameAddress} className="w-auto" />
                    Same as current address
                </label>
            }>
                <Field label="Address" className="sm:col-span-2">
                    <textarea name="permanentAddress" value={form.permanentAddress} onChange={handleChange} rows={2} className="resize-none" placeholder="Street, Area" disabled={sameAddress} />
                </Field>
                <Field label="District">
                    <input name="permanentDistrict" value={form.permanentDistrict} onChange={handleChange} placeholder="District" disabled={sameAddress} />
                </Field>
                <Field label="State">
                    <input name="permanentState" value={form.permanentState} onChange={handleChange} placeholder="State" disabled={sameAddress} />
                </Field>
                <Field label="Country">
                    <input name="permanentCountry" value={form.permanentCountry} onChange={handleChange} placeholder="Country" disabled={sameAddress} />
                </Field>
                <Field label="PIN Code">
                    <input name="permanentPincode" value={form.permanentPincode} onChange={handleChange} placeholder="400001" maxLength={10} disabled={sameAddress} />
                </Field>
            </Section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary flex items-center gap-2" onClick={loadData}>
                    <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 min-w-32 justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Details"}
                </button>
            </div>
        </form>
    );
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const Section = ({ title, children, headerRight }) => (
    <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {headerRight}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            {children}
        </div>
    </div>
);

const Field = ({ label, children, required, className = "" }) => (
    <div className={className}>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
    </div>
);

export default PersonalDetailsTab;
