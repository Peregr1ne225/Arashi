"use client";

import { useCart } from "@/app/contexts/CartContext";
import UserDropdown from "@/app/components/client/UserDropdown";

export default function HeaderIcons() {
  const { totalItems, openCart } = useCart();

  return (
    <div className="flex items-center space-x-0 shrink-0">
      {/* Search Icon */}
      <button className="p-3 text-(--header-text) hover:scale-125 hover:text-black transition-all">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Cart Icon */}
      <button
        onClick={openCart}
        className="relative p-3 text-(--header-text) hover:scale-125 hover:text-black transition-all"
      >
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H14L13 10H5L4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 2L4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12C5 12.5523 5.44772 13 6 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Cart item count badge */}
        {totalItems > 0 && (
          <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </button>

      {/* User Icon */}
      <div className="flex items-center">
        <UserDropdown />
      </div>
    </div>
  );
}
