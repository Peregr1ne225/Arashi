"use client";

import { useState } from "react";
import { Category } from "@/app/types/category";
import HeaderMain from "@/app/components/layout/HeaderParts/HeaderMain";
import HeaderIcons from "@/app/components/layout/HeaderParts/HeaderIcons";
import HeaderNavigation from "@/app/components/layout/HeaderParts/HeaderNavigation";
import MobileCategoryMenu from "./CategoryDropdown/MobileCategoryMenu";

interface HeaderClientProps {
  categories: Category[];
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [mobileCategoryMenuOpen, setMobileCategoryMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-(--header-height) bg-white border-b border-gray-100">
      <div className="h-full flex items-center relative px-[40px]">
        {/* Left: Navigation & Mobile Menu Button */}
        <div className="z-10 flex items-center">
          <div className="lg:hidden mr-4">
            <button
              onClick={() => setMobileCategoryMenuOpen(true)}
              className="text-gray-600 hover:text-[#0e4d80] transition-colors p-2 rounded-full hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
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
          </div>
          <HeaderNavigation categories={categories} />
        </div>

        {/* Center: Logo (Absolutely centered) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <HeaderMain />
          </div>
        </div>

        {/* Right: Icons */}
        <div className="ml-auto z-10">
          <HeaderIcons />
        </div>
      </div>

      {/* Mobile Category Menu */}
      <MobileCategoryMenu
        categories={categories}
        isOpen={mobileCategoryMenuOpen}
        onClose={() => setMobileCategoryMenuOpen(false)}
      />
    </header>
  );
}
