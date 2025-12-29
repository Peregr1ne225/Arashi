"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderMainProps {
  setMobileCategoryMenuOpen: (value: boolean) => void;
}

export default function HeaderMain({
  setMobileCategoryMenuOpen,
}: HeaderMainProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center">
        {/* Logo */}
        <div className="shrink-0">
          <button
            className="lg:hidden mr-4"
            onClick={() => setMobileCategoryMenuOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Link href="/" className="text-2xl font-bold text-black">
            KawJaw
          </Link>
        </div>

        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden lg:flex flex-1 justify-center mx-8">
          <form onSubmit={handleSearch} className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }
              }}
              placeholder="Search for products, brands and more..."
              className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-gray-500"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
