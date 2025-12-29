"use client";

import Link from "next/link";

interface ProductInfoProps {
  productId: number;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
}

// Extract rating component for better maintainability
const RatingStars = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={`star-${i}`}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L9.627 4.608c-.783-.57-1.838.197-1.539 1.118l1.07 3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-gray-400 ml-1">({reviewCount})</span>
    </div>
  );
};

export default function ProductInfo({
  productId,
  name,
  rating,
  reviewCount,
  price,
  originalPrice,
}: ProductInfoProps) {
  return (
    <div className="p-3 pb-0">
      {/* Product Name */}
      <h3 className="text-sm font-bold uppercase italic tracking-wider text-white line-clamp-2 mb-1 min-h-[2.5em]">
        <Link href={`/product/${productId}`} className="hover:text-accent transition-colors">
          {name}
        </Link>
      </h3>

      {/* Rating and Price Stack */}
      <div className="mt-1">
        <RatingStars rating={rating} reviewCount={reviewCount} />

        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-base font-black italic ${originalPrice ? "text-accent" : "text-white"}`}>฿{price}</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through decoration-red-500">
              ฿{originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
