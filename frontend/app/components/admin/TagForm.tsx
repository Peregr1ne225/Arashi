"use client";

import { useState } from "react";
import { X } from "lucide-react";
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
        <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            {/* Header */}
            <div className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] px-8 py-5 flex items-center justify-between shrink-0">
                <h2 className="font-koulen text-2xl text-white tracking-widest uppercase">
                    {initialData ? "Edit Tag" : "New Tag"}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-bold font-istok uppercase tracking-wider border border-red-100">
                        {error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Tag Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        className="block w-full rounded-2xl border-gray-100 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 sm:text-sm py-3 px-4 font-medium bg-gray-50 border outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. New Arrival"
                        required
                    />
                </div>

                {/* Slug */}
                <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            URL Slug
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsAutoSlug(!isAutoSlug)}
                            className="text-[9px] text-gray-400 font-bold uppercase tracking-wider hover:text-[#0e4d80] transition-colors"
                        >
                            {isAutoSlug ? "Auto-generating" : "Switch to Manual"}
                        </button>
                    </div>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setIsAutoSlug(false);
                        }}
                        className={`block w-full rounded-2xl border-gray-100 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 sm:text-sm py-3 px-4 font-medium border outline-none transition-all placeholder:text-gray-400 ${isAutoSlug ? "bg-gray-50 text-gray-400" : "bg-gray-50 text-gray-900"
                            }`}
                        placeholder="e.g. new-arrival"
                        required
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 border border-gray-200 text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-white hover:border-gray-300 transition-all shadow-sm"
                >
                    Discard
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 bg-[#0e4d80] text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-[#0b3d66] transition-all shadow-lg hover:shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "SAVING..." : (initialData ? "UPDATE TAG" : "SAVE TAG")}
                </button>
            </div>
        </form>
    );
}
