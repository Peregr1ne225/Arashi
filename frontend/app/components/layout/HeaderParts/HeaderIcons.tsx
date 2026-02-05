import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";
import UserDropdown from "@/app/components/client/UserDropdown";
import { Search, ShoppingCart, X } from "lucide-react";

export default function HeaderIcons() {
  const { totalItems, openCart } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
      setQuery("");
    }
  };

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <div className="flex items-center space-x-2 shrink-0">
      {/* Search Section */}
      <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? "bg-gray-50 rounded-full px-4 py-1" : ""}`}>
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-(--pastel-blue-dark) font-body font-bold text-sm w-40 md:w-64 placeholder:text-gray-400"
            />
            <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2 text-gray-400 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {!isSearchOpen && (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-3 text-gray-400 hover:text-[#0e4d80] hover:bg-gray-50 rounded-full transition-all group"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Cart Icon */}
      <button
        onClick={openCart}
        className="relative p-3 text-gray-400 hover:text-[#0e4d80] hover:bg-gray-50 rounded-full transition-all group"
      >
        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />

        {/* Cart item count badge */}
        {totalItems > 0 && (
          <span className="absolute top-1 right-1 bg-[#D2042D] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-in zoom-in">
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
