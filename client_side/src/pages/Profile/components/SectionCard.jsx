import { ChevronRight } from "lucide-react";

/**
 * Reusable card for Overview tab matching the exact layout in design screenshot.
 */
const SectionCard = ({
    icon: Icon,
    title,
    completed,
    children,
    onAction,
    actionText = "View / Edit Details",
    iconColor = "text-indigo-600",
}) => {
    return (
        <div className="card bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-xs transition-all h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                        <h3 className="text-xs font-bold text-slate-900">{title}</h3>
                    </div>
                    {completed ? (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2.5 py-0.5 rounded-md">
                            Completed
                        </span>
                    ) : (
                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100/80 px-2.5 py-0.5 rounded-md">
                            Pending
                        </span>
                    )}
                </div>

                {/* Key-Value Pairs List */}
                <div className="space-y-2.5 text-xs">
                    {children}
                </div>
            </div>

            {/* Bottom Action Link */}
            {onAction && (
                <div className="mt-5 pt-3 border-t border-slate-100/60">
                    <button
                        onClick={onAction}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group cursor-pointer"
                    >
                        {actionText}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SectionCard;
