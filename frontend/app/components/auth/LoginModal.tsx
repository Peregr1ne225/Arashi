"use client";

import { useEffect, useRef } from "react";
import LoginForm from "./LoginForm";
import { useRouter } from "next/navigation";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Lock body scroll
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />

            {/* Modal Panel */}
            <div
                ref={modalRef}
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-8 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Close Button */}
                <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="sm:flex sm:items-start w-full">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-2">
                            Welcome Back
                        </h3>
                        <p className="text-sm text-gray-500 mb-8">
                            Sign in to access your account and manage orders.
                        </p>

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
            </div>
        </div>
    );
}
