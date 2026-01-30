"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

interface DeleteHeroModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
    imageTitle?: string;
}

export default function DeleteHeroModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    imageTitle
}: DeleteHeroModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-100 scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-koulen text-black tracking-tight uppercase mb-2">Delete Hero Image?</h3>
                        <p className="text-gray-500 font-istok text-sm leading-relaxed mb-8">
                            Are you sure you want to delete {imageTitle ? (
                                <span className="font-bold text-black text-xs uppercase tracking-widest bg-gray-100 px-1 py-0.5 rounded-xs">&quot;{imageTitle}&quot;</span>
                            ) : "this hero banner"}?
                            This action cannot be undone and it will be removed from the main page hero section.
                        </p>

                        <div className="flex w-full gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-istok text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-[#D2042D] hover:bg-black text-white font-istok text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-red-500/10 flex items-center justify-center disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Confirm Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
