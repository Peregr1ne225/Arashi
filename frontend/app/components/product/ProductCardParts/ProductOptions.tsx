"use client";

import { useCart } from "@/app/contexts/CartContext";
import { Product } from "@/app/types";

interface ProductOptionsProps {
  colors: string[];
  price: number;
  originalPrice?: number;
  product: Product;
}

// Extracted color swatch component for better maintainability
const ColorSwatches = ({ colors }: { colors: string[] }) => {
  return (
    <div className="flex space-x-1 mb-2">
      {colors.slice(0, 4).map((color, index) => (
        <div
          key={`color-${index}-${color}`}
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: color.toLowerCase() }}
          title={color}
        />
      ))}
      {colors.length > 4 && (
        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs">
          +{colors.length - 4}
        </div>
      )}
    </div>
  );
};

// Extracted price component for better maintainability
const PriceDisplay = ({
  price,
  originalPrice,
}: {
  price: number;
  originalPrice?: number;
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className={`text-lg font-semibold ${originalPrice ? "text-red-600" : "text-black"}`}>฿{price}</span>
      {originalPrice && (
        <span className="text-sm text-gray-500 line-through">
          ฿{originalPrice}
        </span>
      )}
    </div>
  );
};

// Extracted add to cart button component for better maintainability
const AddToCartButton = ({
  product,
  price,
}: {
  product: Product;
  price: number;
}) => {
  const { addToCart, getItemQuantity, openCart } = useCart();

  // Check if item is already in cart
  const itemQuantity = getItemQuantity(product.id);
  const isInCart = itemQuantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      openCart();
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`absolute bottom-0 left-0 right-0 py-3 px-4 font-bold uppercase tracking-wider transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-10 flex items-center justify-center gap-2 ${isInCart
        ? "bg-accent text-accent-foreground hover:bg-white"
        : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
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
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <span>{isInCart ? "View in Cart" : "Add to Cart"}</span>
    </button>
  );
};

// Memoized to prevent unnecessary re-renders
export default function ProductOptions({
  colors,
  price,
  originalPrice,
  product,
}: ProductOptionsProps) {
  return (
    <div className="px-2 pb-2 relative">
      {/* Color Swatches - Extracted to separate component */}
      <div className="flex space-x-1 mb-1">
        {colors.slice(0, 4).map((color, index) => (
          <div
            key={`color-${index}-${color}`}
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: color.toLowerCase() }}
            title={color}
          />
        ))}
      </div>

      {/* Add to Cart Button - Appears on hover */}
      <AddToCartButton product={product} price={price} />
    </div>
  );
}
