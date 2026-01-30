"use client";

import { useEffect, useRef, useCallback } from "react";
import LoginForm from "./LoginForm";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/app/hooks/useClickOutside";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Memoize onClose to avoid unnecessary hook re-runs
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Close on click outside
    useClickOutside(modalRef, handleClose, isOpen);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0e4d80]/20 backdrop-blur-sm transition-opacity"
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div
                ref={modalRef}
                className="relative transform overflow-hidden rounded-4xl bg-white text-left shadow-2xl shadow-blue-900/10 transition-all sm:my-8 w-full max-w-lg pt-12 pb-10 animate-in fade-in zoom-in-95 duration-300 border border-gray-100"
            >
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        type="button"
                        className="rounded-full p-2 bg-gray-50 text-gray-400 hover:text-[#0e4d80] hover:bg-blue-50 focus:outline-none transition-colors"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <LoginForm
                    onSuccess={() => {
                        onClose();
                        // Refresh logic could go here if needed
                    }}
                    onRegisterClick={() => {
                        onClose();
                        router.push("/register");
                    }}
                // No redirectTo -> stays on page (reloads context)
                />
            </div>
        </div>
    );
}
