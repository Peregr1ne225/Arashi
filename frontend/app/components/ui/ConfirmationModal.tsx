"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    variant?: 'default' | 'danger';
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    variant = 'default',
}: ConfirmationModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all animate-scaleIn border border-gray-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="mb-6">
                    <h3 id="modal-title" className={`text-xl font-bold font-koulen uppercase tracking-wide mb-2 ${variant === 'danger' ? 'text-red-600' : 'text-black'}`}>
                        {title}
                    </h3>
                    <p className="text-gray-600 font-istok text-lg">
                        {message}
                    </p>
                </div>

                <div className="flex gap-4 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2 rounded-[8px] border border-gray-200 text-black font-istok uppercase tracking-wider font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            px-6 py-2 rounded-[8px] font-istok uppercase tracking-wider font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer text-white
                            ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1e1c15] hover:bg-black'}
                        `}
                    >
                        {isLoading && (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
