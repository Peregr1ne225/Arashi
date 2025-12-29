"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/app/types";
import HeaderMain from "@/app/components/layout/HeaderParts/HeaderMain";
import HeaderIcons from "@/app/components/layout/HeaderParts/HeaderIcons";
import HeaderNavigation from "@/app/components/layout/HeaderParts/HeaderNavigation";
import MobileCategoryMenu from "./CategoryDropdown/MobileCategoryMenu";

interface HeaderClientProps {
  categories: Category[];
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const [isCategoriesOpen, setIsCategoriesOpen] = useState(false); // Prepared for future use
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileCategoryMenuOpen, setMobileCategoryMenuOpen] = useState(false);
  const router = useRouter();

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setIsSearchOpen(false);
      setMobileSearchQuery("");
    }
  };

  // Prepare for cart functionality
  const cartItemCount = 0; // Placeholder for cart count - will be connected to state management

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-accent shadow-none">
      <div className="flex items-center">
        <HeaderMain setMobileCategoryMenuOpen={setMobileCategoryMenuOpen} />
        <HeaderIcons
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />
      </div>

      <HeaderNavigation categories={categories} />

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-md p-4 z-40">
          <form onSubmit={handleMobileSearch}>
            <div className="relative w-full">
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (mobileSearchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
                      setIsSearchOpen(false);
                      setMobileSearchQuery("");
                    }
                  }
                }}
                placeholder="Search for products, brands and more..."
                className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
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
            </div>
          </form>
        </div>
      )}

      {/* Mobile Category Menu */}
      <MobileCategoryMenu
        categories={categories}
        isOpen={mobileCategoryMenuOpen}
        onClose={() => setMobileCategoryMenuOpen(false)}
      />
    </header>
  );
}
