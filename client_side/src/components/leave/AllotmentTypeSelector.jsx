import React from 'react';
import { X, Users, User } from 'lucide-react';

const AllotmentTypeSelector = ({ open, onClose, onSelectBulk, onSelectIndividual }) => {
    if (!open) return null;

    return (
        <div className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 pb-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Leave Allotment Type</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Choose how you want to allot leaves to employees
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    
                    <button
                        onClick={onSelectBulk}
                        className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-semibold text-slate-900 mb-1">Bulk Allotment</h3>
                                <p className="text-sm text-slate-600">
                                    Allot same leave types and days to all or multiple employees at once for a specific year.
                                </p>
                            </div>
                            <div className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                    </button>

                    <button
                        onClick={onSelectIndividual}
                        className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                                <User className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-semibold text-slate-900 mb-1">Individual Allotment</h3>
                                <p className="text-sm text-slate-600">
                                    Allot specific leave types and days to individual employees with custom configurations.
                                </p>
                            </div>
                            <div className="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllotmentTypeSelector;
