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
    variant?: "default" | "danger";
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
    variant = "default",
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
                className="bg-[#FDFDFB] rounded-4xl shadow-2xl shadow-blue-900/10 max-w-md w-full p-8 transform transition-all animate-scaleIn border border-gray-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="mb-6">
                    <h3
                        id="modal-title"
                        className={`text-2xl font-bold font-koulen uppercase tracking-wide mb-2 ${variant === "danger" ? "text-red-600" : "text-[#0e4d80]"}`}
                    >
                        {title}
                    </h3>
                    <p className="text-gray-500 font-istok text-lg leading-relaxed">{message}</p>
                </div>

                <div className="flex gap-4 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-full border border-gray-100 text-gray-400 font-istok uppercase tracking-[0.2em] font-bold text-[10px] hover:bg-white hover:text-gray-600 hover:border-gray-200 transition-all disabled:opacity-50 cursor-pointer min-w-[120px]"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            px-8 py-3 rounded-full font-istok uppercase tracking-[0.2em] font-bold text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-white min-w-[120px] shadow-lg
                            ${variant === "danger" ? "bg-red-600 hover:bg-red-700 shadow-red-900/10" : "bg-[#0e4d80] hover:bg-[#0b3d66] shadow-blue-900/10"}
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
        document.body,
    );
}
