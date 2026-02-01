"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface MessageModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: "success" | "error" | "info";
}

export default function MessageModal({
    isOpen,
    title,
    message,
    onClose,
    type = "info",
}: MessageModalProps) {
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

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <div className="p-3 bg-green-50 rounded-full text-green-600 mb-4 ring-8 ring-green-50/50">
                        <CheckCircle size={32} />
                    </div>
                );
            case "error":
                return (
                    <div className="p-3 bg-red-50 rounded-full text-red-600 mb-4 ring-8 ring-red-50/50">
                        <AlertCircle size={32} />
                    </div>
                );
            default:
                return (
                    <div className="p-3 bg-blue-50 rounded-full text-[#0e4d80] mb-4 ring-8 ring-blue-50/50">
                        <Info size={32} />
                    </div>
                );
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div
                className="bg-[#FDFDFB] rounded-4xl shadow-2xl shadow-blue-900/10 max-w-sm w-full p-8 transform transition-all animate-scaleIn border border-gray-100 flex flex-col items-center text-center"
                role="dialog"
                aria-modal="true"
            >
                {getIcon()}

                <div className="mb-6">
                    <h3
                        className={`text-2xl font-bold font-koulen uppercase tracking-wide mb-2 ${type === "error" ? "text-red-600" : "text-[#0e4d80]"
                            }`}
                    >
                        {title}
                    </h3>
                    <p className="text-gray-500 font-istok text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-full font-istok uppercase tracking-[0.2em] font-bold text-[10px] transition-all cursor-pointer text-white shadow-lg bg-[#0e4d80] hover:bg-[#0b3d66] shadow-blue-900/10 w-full hover:-translate-y-0.5 active:scale-95"
                >
                    Close
                </button>
            </div>
        </div>,
        document.body
    );
}
