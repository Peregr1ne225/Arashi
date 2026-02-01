"use client";

import { useState } from "react";

interface SizeFormProps {
    initialData?: { id: number; name: string; slug: string } | null;
    onSubmit: (data: { name: string; slug: string }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function SizeForm({ initialData, onSubmit, onCancel, isLoading }: SizeFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Size name is required");
            return;
        }

        try {
            await onSubmit({ name, slug: slug || name.toLowerCase().replace(/\s+/g, "-") });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-koulen text-3xl tracking-wide text-[#0e4d80]">
                    {initialData ? "EDIT SIZE" : "NEW SIZE"}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-bold font-istok uppercase tracking-wider border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider font-istok mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            // Auto-generate slug if creating new
                            if (!initialData) {
                                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                            }
                        }}
                        className="block w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#0e4d80]/5 focus:border-[#0e4d80] outline-none font-istok text-base transition-all"
                        placeholder="e.g. Large, XL, 42"
                        required
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider font-istok mb-1">
                        Slug (Optional)
                    </label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#0e4d80]/5 focus:border-[#0e4d80] outline-none font-istok text-base transition-all"
                        placeholder="e.g. large, xl, 42"
                    />
                    <p className="mt-1 text-xs text-gray-500 font-istok">
                        Leave empty to auto-generate from name.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white py-3 px-8 border border-gray-200 rounded-full shadow-sm text-[10px] font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-[0.2em] font-istok transition-all"
                >
                    Discard
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-3 px-10 border border-transparent shadow-lg text-[10px] font-bold rounded-full text-white bg-[#0e4d80] hover:bg-[#0b3d66] focus:outline-none disabled:opacity-50 uppercase tracking-[0.2em] font-istok transform transition-all active:scale-95"
                >
                    {isLoading ? "SAVING..." : (initialData ? "UPDATE SIZE" : "SAVE SIZE")}
                </button>
            </div>
        </form>
    );
}
