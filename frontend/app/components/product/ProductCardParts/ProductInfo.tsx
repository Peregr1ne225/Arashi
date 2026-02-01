"use client";

import { memo } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { ProductColor } from "@/app/types/product";
import { getImageUrl } from "@/app/lib/utils/image";

interface ProductInfoProps {
  productId: number;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  colors?: ProductColor[];
  onColorHover?: (image: string | null) => void;
  onColorLeave?: () => void;
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

function ProductInfoComponent({
  productId,
  name,
  rating,
  reviewCount,
  price,
  originalPrice,
  colors,
  onColorHover,
  onColorLeave,
}: ProductInfoProps) {
  return (
    <div className="px-1">
      {/* Color Swatches */}
      {colors && colors.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap h-6 content-center items-center">
          {colors.slice(0, 4).map((color) => (
            <div
              key={color.id}
              className="w-6 h-6 rounded-full border border-gray-200 shadow-sm relative overflow-hidden ring-1 ring-transparent hover:ring-black hover:scale-110 transition-all"
              title={color.color_name}
              style={{ backgroundColor: color.color_code }}
              onMouseEnter={() => onColorHover?.(getImageUrl(color.image))}
              onMouseLeave={() => onColorLeave?.()}
            >
              {color.image && (
                <NextImage
                  src={getImageUrl(color.image)}
                  alt={color.color_name}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              )}
            </div>
          ))}
          {colors.length > 4 && (
            <span className="text-[10px] text-gray-500 font-medium ml-1">
              +{colors.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Product Name */}
      <h3 className="text-[16px] leading-tight font-koulen text-black line-clamp-2 mb-2 min-h-[2.5em] tracking-wide uppercase">
        <Link
          href={`/product/${productId}`}
          className="hover:underline decoration-1 underline-offset-2"
        >
          {name}
        </Link>
      </h3>

      {/* Rating and Price Stack */}
      <div className="flex justify-between items-end mt-1">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[16px] font-koulen tracking-wide font-medium ${originalPrice ? "text-[#ff5252]" : "text-black"}`}
            >
              ฿{price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-[12px] font-kodchasan text-gray-400 line-through decoration-gray-400">
                ฿{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="mt-1">
            <RatingStars rating={rating} reviewCount={reviewCount} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export default memo(ProductInfoComponent, (prevProps, nextProps) => {
  return (
    prevProps.productId === nextProps.productId &&
    prevProps.name === nextProps.name &&
    prevProps.rating === nextProps.rating &&
    prevProps.reviewCount === nextProps.reviewCount &&
    prevProps.price === nextProps.price &&
    prevProps.originalPrice === nextProps.originalPrice &&
    prevProps.colors === nextProps.colors &&
    prevProps.onColorHover === nextProps.onColorHover &&
    prevProps.onColorLeave === nextProps.onColorLeave
  );
});
