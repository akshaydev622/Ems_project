import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    open,
    onClose,
    onCancel,
    title,
    subtitle,
    children,
    footer,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = '',
    // Optional confirmation mode props
    onConfirm,
    okText = 'Yes',
    cancelText = 'Cancel',
    loading = false,
}) => {
    const handleClose = onClose || onCancel;

    // Disable background scrolling when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && open && handleClose) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handleClose]);

    if (!open) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-xl',
        xl: 'max-w-2xl',
        '2xl': 'max-w-3xl',
        full: 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]',
    };

    const containerSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto"
            onClick={closeOnOverlayClick && handleClose ? handleClose : undefined}
        >
            <div
                className={`relative bg-white rounded-2xl shadow-2xl w-full flex flex-col transform transition-all animate-slide-up ${containerSize} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="relative px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            {title && <h3 className="font-semibold text-lg text-slate-900">{title}</h3>}
                            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                        </div>
                        {showCloseButton && handleClose && (
                            <button
                                type="button"
                                onClick={handleClose}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-5 flex-1 overflow-y-auto max-h-[calc(80vh-8rem)]">
                    {children}
                </div>

                {/* Footer */}
                {footer !== undefined ? (
                    footer && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                            {footer}
                        </div>
                    )
                ) : onConfirm ? (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex gap-3">
                        {handleClose && (
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="btn-secondary flex-1"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`btn-primary flex-1 flex justify-center items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Processing...' : okText}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Modal;