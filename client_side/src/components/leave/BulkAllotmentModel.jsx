import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckSquare, Square } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const BulkAllotmentModel = ({ open, onClose }) => {
    const [step, setStep] = useState(1);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [selectedLeaveTypes, setSelectedLeaveTypes] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    useEffect(() => {
        if (open) {
            fetchInitialData();
            setYear(new Date().getFullYear().toString());
            setStep(1);
            setPreviewData(null);
        }
    }, [open]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch active leave types
            const leaveRes = await api.get('/leave-types');
            const activeLeaveTypes = (leaveRes.data.leaveTypes || []).filter(type => type.status === 'ACTIVE');
            setLeaveTypes(activeLeaveTypes);
            setSelectedLeaveTypes(activeLeaveTypes.map(t => t._id || t.id));

            // Fetch employees for count
            const empRes = await api.get('/employees');
            setTotalEmployees(empRes.data.employees?.length || 0);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const toggleLeaveType = (id) => {
        if (selectedLeaveTypes.includes(id)) {
            setSelectedLeaveTypes(prev => prev.filter(t => t !== id));
        } else {
            setSelectedLeaveTypes(prev => [...prev, id]);
        }
    };

    const handlePreview = async () => {
        if (!year) {
            toast.error("Please select a year");
            return;
        }
        if (selectedLeaveTypes.length === 0) {
            toast.error("Please select at least one leave type");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/leave-allotment/preview', {
                year: parseInt(year),
                leaveTypeIds: selectedLeaveTypes
            });

            setPreviewData(response.data);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to generate preview");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const currentYear = new Date().getFullYear();

    return (
        <div className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in my-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 pb-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Bulk Allotment Flow</h2>
                        <p className="text-sm font-medium text-indigo-600 mt-1">
                            {step === 1 ? 'Step 1: Allocation Setup' : step === 2 ? 'Step 2: Preview Allocation' : 'Step 3: Confirmation Dialog'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                        </div>
                    ) : step === 1 ? (
                        <>
                            {/* Year Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Year <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow appearance-none bg-white text-slate-700"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        <option value={currentYear.toString()}>Current Year ({currentYear})</option>
                                        <option value={(currentYear + 1).toString()}>Next Year ({currentYear + 1})</option>
                                    </select>
                                </div>
                            </div>

                            {/* Leave Types Section */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 mb-3">Leave Types to Allot</h3>
                                {leaveTypes.length === 0 ? (
                                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-sm text-slate-500">
                                        No active leave types found.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {leaveTypes.map(type => {
                                            const id = type._id || type.id;
                                            const isSelected = selectedLeaveTypes.includes(id);
                                            return (
                                                <div
                                                    key={id}
                                                    onClick={() => toggleLeaveType(id)}
                                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-semibold text-slate-900">{type.name}</div>
                                                        <button className={`p-0.5 rounded-md transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}>
                                                            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-slate-500 mt-auto flex items-center justify-between">
                                                        <span>Max Days:</span>
                                                        <span className="font-medium text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{type.annualLimit}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Employee Statistics */}
                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 rounded-xl border border-indigo-100 flex items-center justify-between mt-8">
                                <div className="text-sm font-medium text-slate-600">Total Active Employees</div>
                                <div className="text-2xl font-bold text-indigo-600">{totalEmployees}</div>
                            </div>
                        </>
                    ) : step === 2 ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                                <h3 className="font-semibold text-slate-800">Summary Card</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500 block mb-1">Year</span>
                                        <span className="font-medium text-slate-900">{previewData?.year}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block mb-1">Total Employees</span>
                                        <span className="font-medium text-slate-900">{previewData?.employeeCount}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-2 text-sm">Selected Leave Types</span>
                                    <div className="flex flex-wrap gap-2">
                                        {previewData?.leaveTypes?.map(t => (
                                            <div key={t.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm flex gap-2 shadow-sm">
                                                <span className="font-medium text-slate-700">{t.name}</span>
                                                <span className="text-slate-400">=</span>
                                                <span className="font-bold text-indigo-600">{t.days}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                        <span className="text-slate-600 font-medium text-sm">Total Allocation Records To Create</span>
                                        <span className="text-2xl font-bold text-indigo-600">{previewData?.expectedRecords}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                                <div className="mt-0.5 text-lg leading-none">⚠️</div>
                                <p className="leading-relaxed">Leave balances will be created for all active employees. Existing allocations for the selected year will not be duplicated.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in py-6 text-center">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Leave Allocation</h3>
                            <div className="text-slate-600 space-y-3 px-4">
                                <p>You are about to allocate leave balances for all active employees for year <span className="font-semibold text-slate-900">{year}</span>.</p>
                                <p>This action will create leave balances for employees who do not already have allocations for the selected year.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl bg-slate-50/50">
                    {step === 1 ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePreview}
                                disabled={loading || selectedLeaveTypes.length === 0}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                Preview Allocation
                            </button>
                        </>
                    ) : step === 2 ? (
                        <>
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setPreviewData(null);
                                }}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                Confirm Allocation
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(2)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const response = await api.post('/leave-allotment/bulk', {
                                            year: parseInt(year),
                                            leaveTypeIds: selectedLeaveTypes
                                        });
                                        
                                        toast.success(
                                            `Leave allocation completed!\n` +
                                            `Employees processed: ${response.data.employeesProcessed}\n` +
                                            `Records created: ${response.data.recordsCreated}\n` +
                                            `Duplicates skipped: ${response.data.duplicatesSkipped}`
                                        );
                                        onClose();
                                    } catch (error) {
                                        toast.error(error.response?.data?.error || 'Failed to allocate leaves');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                {loading ? 'Processing...' : 'Yes, Allocate Leave'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkAllotmentModel;
