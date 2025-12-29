"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductImageProps {
  productId: number;
  images: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  discount?: number;
}

// Extracted badge components for better maintainability
const DiscountBadge = ({ discount }: { discount: number }) => (
  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
    -{discount}%
  </div>
);

const NewBadge = () => (
  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
    NEW
  </div>
);

const BestsellerBadge = () => (
  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
    BESTSELLER
  </div>
);

const WishlistButton = ({ productId }: { productId: number }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    // In a real app, this would make an API call
  };

  return (
    <button
      className="p-2 hover:bg-white/20 rounded"
      onClick={toggleWishlist}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`}
        fill={isWishlisted ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-xs text-white">Wishlist</span>
    </button>
  );
};

// Memoized to prevent unnecessary re-renders
export default function ProductImage({
  productId,
  images,
  isNew,
  isBestseller,
  discount,
}: ProductImageProps) {
  return (
    <div className="relative overflow-hidden">
      <Link href={`/product/${productId}`} className="block">
        <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden relative">
          {/* Primary Image */}
          <Image
            src={images[0] || "/placeholder-product.svg"}
            alt={`Product ${productId}`}
            width={500}
            height={650}
            className={`w-full h-80 object-cover object-center transition-opacity duration-500 ease-in-out ${images.length > 1 ? "group-hover:opacity-0" : ""
              }`}
            loading="lazy"
          />

          {/* Secondary Image (Hover) */}
          {images.length > 1 && (
            <Image
              src={images[1]}
              alt={`Product ${productId} - Back`}
              width={500}
              height={650}
              className="absolute inset-0 w-full h-80 object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      {/* Discount Badge */}
      {discount ? <DiscountBadge discount={discount} /> : null}

      {/* New Badge */}
      {isNew && <NewBadge />}

      {/* Bestseller Badge */}
      {isBestseller && <BestsellerBadge />}

      {/* Quick Actions */}
      {/* <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex justify-around">
          <WishlistButton productId={productId} />
        </div>
      </div> */}
    </div>
  );
}
