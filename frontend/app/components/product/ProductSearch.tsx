"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductSearch() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative w-full md:w-100">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full bg-[#E5E5E5] text-sm text-black placeholder-gray-500 py-3 pl-10 pr-6 focus:outline-none font-istok rounded-none transition-colors text-right tracking-wide"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
            </div>
        </form>
    );
}
