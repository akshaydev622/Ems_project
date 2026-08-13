import { useState, useEffect } from "react";
import { Loader2, Save, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { fetchBankDetails, saveBankDetails } from "../services/myProfileApi";

const PAY_MODES = [
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "DEMAND_DRAFT", label: "Demand Draft" },
    { value: "CASE_IN_HAND", label: "Cash in Hand" },
];

const INITIAL = {
    salaryPayMode: "BANK_TRANSFER",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    branchName: "",
    branchAddress: "",
};

const BankDetailsTab = ({ onSaveSuccess }) => {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAccNum, setShowAccNum] = useState(false);
    const [hasExisting, setHasExisting] = useState(false);
    const [maskedDisplay, setMaskedDisplay] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchBankDetails();
                if (data.details) {
                    setHasExisting(true);
                    setMaskedDisplay(data.details.accountNumber); // already masked from API
                    setForm({
                        salaryPayMode: data.details.salaryPayMode || "BANK_TRANSFER",
                        bankName: data.details.bankName || "",
                        accountNumber: "", // don't pre-fill — user must re-enter to update
                        confirmAccountNumber: "",
                        ifscCode: data.details.ifscCode || "",
                        branchName: data.details.branchName || "",
                        branchAddress: data.details.branchAddress || "",
                    });
                }
            } catch {
                toast.error("Failed to load bank details");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "ifscCode" ? value.toUpperCase() : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.accountNumber && form.accountNumber !== form.confirmAccountNumber) {
            toast.error("Account numbers do not match");
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form };
            // If user left accountNumber blank in edit mode, don't send it
            if (hasExisting && !payload.accountNumber) {
                delete payload.accountNumber;
                delete payload.confirmAccountNumber;
            }
            const { data } = await saveBankDetails(payload);
            if (data.data?.accountNumber) setMaskedDisplay(data.data.accountNumber);
            setHasExisting(true);
            toast.success("Bank details saved successfully");
            onSaveSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save bank details");
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
            {/* Security notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <ShieldCheck className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-medium text-indigo-800">Sensitive Information</p>
                    <p className="text-xs text-indigo-600 mt-0.5">
                        Your bank details are encrypted and stored securely. The account number is masked when displayed.
                    </p>
                </div>
            </div>

            <div className="card p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-5 pb-4 border-b border-slate-100">Bank Account Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                    {/* Salary Pay Mode */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Salary Pay Mode</label>
                        <select name="salaryPayMode" value={form.salaryPayMode} onChange={handleChange}>
                            {PAY_MODES.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Bank Name <span className="text-rose-500">*</span></label>
                        <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. HDFC Bank" required />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">IFSC Code <span className="text-rose-500">*</span></label>
                        <input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="HDFC0001234" maxLength={11} required />
                    </div>

                    {/* Account Number */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Account Number {!hasExisting && <span className="text-rose-500">*</span>}
                            {hasExisting && <span className="text-slate-400 font-normal ml-1">(leave blank to keep current)</span>}
                        </label>
                        {hasExisting && maskedDisplay && !form.accountNumber && (
                            <div className="mb-2 px-3 py-2 bg-slate-100 rounded-md text-xs font-mono text-slate-600">
                                Current: {maskedDisplay}
                            </div>
                        )}
                        <div className="relative">
                            <input
                                name="accountNumber"
                                value={form.accountNumber}
                                onChange={handleChange}
                                type={showAccNum ? "text" : "password"}
                                placeholder={hasExisting ? "Enter to change account number" : "Account number"}
                                required={!hasExisting}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowAccNum((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                tabIndex={-1}
                            >
                                {showAccNum ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Account Number */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Confirm Account Number {form.accountNumber && <span className="text-rose-500">*</span>}
                        </label>
                        <input
                            name="confirmAccountNumber"
                            value={form.confirmAccountNumber}
                            onChange={handleChange}
                            type="password"
                            placeholder="Re-enter account number"
                            required={!!form.accountNumber}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Branch Name <span className="text-rose-500">*</span></label>
                        <input name="branchName" value={form.branchName} onChange={handleChange} placeholder="Branch name" required />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Branch Address <span className="text-rose-500">*</span></label>
                        <input name="branchAddress" value={form.branchAddress} onChange={handleChange} placeholder="Branch address" required />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 min-w-36 justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : hasExisting ? "Update Bank Details" : "Save Bank Details"}
                </button>
            </div>
        </form>
    );
};

export default BankDetailsTab;
