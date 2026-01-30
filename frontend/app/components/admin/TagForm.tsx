"use client";

import { useState } from "react";
import { Tag } from "@/app/types/attributes";

interface TagFormProps {
    initialData?: Tag | null;
    onSubmit: (data: { name: string; slug: string }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function TagForm({ initialData, onSubmit, onCancel, isLoading }: TagFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [isAutoSlug, setIsAutoSlug] = useState(!initialData?.slug);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (isAutoSlug) {
            setSlug(newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Tag name is required");
            return;
        }

        try {
            await onSubmit({ name, slug });
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
                    {initialData ? "EDIT TAG" : "NEW TAG"}
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
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm font-bold font-istok">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider font-istok mb-1">
                        Tag Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="e.g. New Arrival"
                        className="block w-full px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 font-istok text-base"
                        required
                    />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider font-istok">
                            Slug
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsAutoSlug(!isAutoSlug)}
                            className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-black transition-colors"
                        >
                            {isAutoSlug ? "Auto-generating" : "Manual Input"}
                        </button>
                    </div>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setIsAutoSlug(false);
                        }}
                        placeholder="e.g. new-arrival"
                        className={`block w-full px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 font-istok text-base ${isAutoSlug ? "bg-gray-50" : "bg-white"}`}
                        required
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="bg-white py-2 px-6 border border-gray-300 rounded shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider font-istok"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-8 border border-transparent shadow-lg text-sm font-bold rounded text-white bg-linear-to-b from-[#0e4d80] to-[#D2042D] hover:opacity-90 focus:outline-none disabled:opacity-50 uppercase tracking-wider font-istok transform transition-transform hover:scale-105"
                >
                    {isLoading ? "Saving..." : initialData ? "Update Tag" : "Create Tag"}
                </button>
            </div>
        </form>
    );
}
