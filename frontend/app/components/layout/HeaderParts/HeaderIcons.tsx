"use client";

import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/app/contexts/CartContext";
import UserDropdown from "@/app/components/client/UserDropdown";

interface HeaderIconsProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean) => void;
}

export default function HeaderIcons({
  isSearchOpen,
  setIsSearchOpen,
}: HeaderIconsProps) {
  const { user } = useAuth();
  const { totalItems, openCart } = useCart();

  return (
    <div className="flex items-center space-x-4 shrink-0">
      {/* Mobile Search Icon */}
      <button
        className="lg:hidden"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      <div className="hidden sm:block">
        <UserDropdown />
      </div>
      <button onClick={openCart} className="relative">
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {/* Cart item count badge */}
        {totalItems > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </button>
    </div >
  );
}
