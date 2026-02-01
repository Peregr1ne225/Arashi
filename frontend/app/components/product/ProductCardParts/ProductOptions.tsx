"use client";

import { useCart } from "@/app/contexts/CartContext";
import { ProductCardData } from "@/app/types/product";

import { useState } from "react";
import QuickAddModal from "@/app/components/product/QuickAddModal";

interface ProductOptionsProps {
  product: ProductCardData;
}

// Extracted add to cart button component for better maintainability
const AddToCartButton = ({
  product,
}: {
  product: ProductCardData;
}) => {
  const { getItemQuantity } = useCart();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Check if item is already in cart - Simplistic check for base product ID
  // For variant products, this might be misleading if we have one variant but not another.
  // But for the "Add to Bag" button appearance, checking total quantity > 0 is reasonable.
  const itemQuantity = getItemQuantity(product.id);
  const isInCart = itemQuantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickAddOpen(true);
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        className={`w-[calc(100%-24px)] mx-3 mb-3 py-2.5 px-4 transition-all duration-300 font-koulen tracking-wider text-[14px] uppercase flex items-center justify-center gap-2 rounded-full shadow-lg ${isInCart
          ? "bg-green-700 hover:bg-green-800 text-white"
          : "bg-[#0e4d80] hover:bg-[#0a3a60] text-white"
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>{isInCart ? "Add More" : "Add to Bag"}</span>
      </button>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <QuickAddModal
            product={product}
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
          />
        </div>
      )}
    </>
  );
};

// Memoized to prevent unnecessary re-renders
export default function ProductOptions({
  product,
}: ProductOptionsProps) {
  return (
    <div className="relative">
      {/* Add to Cart Button - Slide up animation handled by parent group hover + this opacity transition */}
      <div className="w-full transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
