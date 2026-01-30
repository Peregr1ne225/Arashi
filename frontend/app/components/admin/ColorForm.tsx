"use client";

import { useState } from "react";
import { Color } from "@/app/types/attributes";

interface ColorFormProps {
    initialData?: Color | null;
    onSubmit: (data: { name: string; code: string }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ColorForm({ initialData, onSubmit, onCancel, isLoading }: ColorFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [code, setCode] = useState(initialData?.code || "#000000");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Color name is required");
            return;
        }
        if (!code.trim()) {
            setError("Color code is required");
            return;
        }

        try {
            await onSubmit({ name, code });
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
                    {initialData ? "EDIT COLOR" : "NEW COLOR"}
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
                <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider font-istok mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 font-istok text-base"
                        placeholder="e.g. Midnight Blue"
                        required
                    />
                </div>

                {/* Hex Code */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider font-istok mb-1">
                        Color Code
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="color"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="h-10 w-20 p-1 border border-gray-300 rounded shadow-sm cursor-pointer"
                        />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 font-istok uppercase text-base"
                            placeholder="#000000"
                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white py-2 px-6 border border-gray-300 rounded shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider font-istok"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-8 border border-transparent shadow-lg text-sm font-bold rounded text-white bg-linear-to-b from-[#0e4d80] to-[#D2042D] hover:opacity-90 focus:outline-none disabled:opacity-50 uppercase tracking-wider font-istok transform transition-transform hover:scale-105"
                >
                    {isLoading ? "Saving..." : (initialData ? "Update Color" : "Create Color")}
                </button>
            </div>
        </form>
    );
}
