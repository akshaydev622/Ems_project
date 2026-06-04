import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const IndividualAllotmentModel = ({ open, onClose }) => {
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [currentBalance, setCurrentBalance] = useState(null);

    // Form state
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [days, setDays] = useState('');
    const [reason, setReason] = useState('');

    // Employee Search Dropdown State
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (open) {
            fetchInitialData();
            // Reset form
            setSelectedEmployee('');
            setSearchTerm('');
            setYear(new Date().getFullYear().toString());
            setSelectedLeaveType('');
            setDays('');
            setReason('');
            setShowDropdown(false);
            setStep(1);
            setCurrentBalance(null);
        }
    }, [open]);

    // Handle clicking outside of dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [empRes, leaveRes] = await Promise.all([
                api.get('/employees'),
                api.get('/leave-types')
            ]);

            setEmployees(empRes.data.employees || []);
            setLeaveTypes((leaveRes.data.leaveTypes || []).filter(t => t.status === 'ACTIVE'));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (!selectedEmployee) return toast.error('Please select an employee');
        if (!year) return toast.error('Please select a year');
        if (!selectedLeaveType) return toast.error('Please select a leave type');
        if (!days || days <= 0 || days > 100) return toast.error('Please enter valid days');

        setLoading(true);
        try {
            const res = await api.post('/leave-allotment/preview-employee', {
                employeeId: selectedEmployee,
                leaveTypeId: selectedLeaveType,
                year: parseInt(year),
                days: parseInt(days)
            });
            setCurrentBalance(res.data.data); // This now holds preview data
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Validation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await api.post('/leave-allotment/employee', {
                employeeId: selectedEmployee,
                leaveTypeId: selectedLeaveType,
                year: parseInt(year),
                days: parseInt(days),
                reason: reason || null
            });

            toast.success(response.data.message || 'Leave allocation created successfully!');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save allocation');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentYear = new Date().getFullYear();
    const selectedEmpDetails = employees.find(e => (e._id || e.id) === selectedEmployee);

    return (
        <div className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in my-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 pb-0 border-b border-slate-100 mb-6">
                    <div className="pb-4">
                        <h2 className="text-xl font-bold text-slate-900">Individual Allotment Flow</h2>
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                            {step === 1 ? 'Step 1: Allocation Setup' : 'Step 2: Preview & Confirm'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 -mt-4 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    {step === 1 ? (
                        <div className="space-y-5 animate-fade-in">
                            {/* Employee (Searchable Dropdown) */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Employee <span className="text-rose-500">*</span></label>
                                <div
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 cursor-text flex justify-between items-center"
                                    onClick={() => setShowDropdown(true)}
                                >
                                    {selectedEmpDetails ? (
                                        <span>{selectedEmpDetails.firstName} {selectedEmpDetails.lastName}</span>
                                    ) : (
                                        <span className="text-slate-400">Search employee...</span>
                                    )}
                                    {selectedEmpDetails && (
                                        <X
                                            className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEmployee('');
                                                setSearchTerm('');
                                            }}
                                        />
                                    )}
                                </div>

                                {showDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                        <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
                                            <input
                                                type="text"
                                                placeholder="Type to search..."
                                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                            />
                                        </div>
                                        {filteredEmployees.length === 0 ? (
                                            <div className="p-3 text-sm text-slate-500 text-center">No employees found</div>
                                        ) : (
                                            filteredEmployees.map(emp => (
                                                <div
                                                    key={emp._id || emp.id}
                                                    className="px-4 py-2 hover:bg-emerald-50 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        setSelectedEmployee(emp._id || emp.id);
                                                        setSearchTerm('');
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    <div className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-xs text-slate-500">{emp.email}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Year & Leave Type row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Year <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-700"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        >
                                            <option value={currentYear.toString()}>Current Year ({currentYear})</option>
                                            <option value={(currentYear + 1).toString()}>Next Year ({currentYear + 1})</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Leave Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type <span className="text-rose-500">*</span></label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-700"
                                        value={selectedLeaveType}
                                        onChange={(e) => setSelectedLeaveType(e.target.value)}
                                    >
                                        <option value="" disabled>Select Type</option>
                                        {leaveTypes.map(type => (
                                            <option key={type._id || type.id} value={type._id || type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Days */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Days <span className="text-rose-500">*</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 10"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-700"
                                />
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Reason <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <textarea
                                    placeholder="Enter reason for allotment..."
                                    rows="3"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-700 resize-none"
                                ></textarea>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in pt-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                <h3 className="font-semibold text-slate-800 mb-4">Allocation Preview</h3>

                                <div className="space-y-4">
                                    {currentBalance && (
                                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                                                <div className="p-4">
                                                    <div className="text-xs text-slate-500 mb-1">Employee Name</div>
                                                    <div className="font-semibold text-slate-900">{currentBalance.employeeName}</div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="text-xs text-slate-500 mb-1">Year</div>
                                                    <div className="font-semibold text-slate-900">{currentBalance.year}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                                                <div className="p-4">
                                                    <div className="text-xs text-slate-500 mb-1">Leave Type</div>
                                                    <div className="font-semibold text-slate-900">{currentBalance.leaveTypeName}</div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="text-xs text-slate-500 mb-1">Annual Limit</div>
                                                    <div className="font-semibold text-slate-900">{currentBalance.annualLimit} Days</div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-emerald-50/50">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-emerald-800">Requested Days</div>
                                                        <div className="text-xs text-emerald-600/80 mt-0.5">Will be allocated to employee</div>
                                                    </div>
                                                    <div className="text-2xl font-bold text-emerald-600">
                                                        {currentBalance.requestedDays}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reason && (
                                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                                            <div className="text-xs text-slate-500 mb-1">Reason</div>
                                            <div className="text-sm text-slate-700">{reason}</div>
                                        </div>
                                    )}
                                </div>
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
                                onClick={handleNext}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                {loading ? 'Validating...' : 'Preview Allocation'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                Confirm Allocation
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IndividualAllotmentModel;
