const ConfirmModal = ({ open, title = "Confirm Action", message, okText = "Yes", onConfirm, onCancel, loading = false }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-fade-in overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
                </div>
                <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 transition duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Please wait..." : okText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
