"use client";

import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/app/lib/utils/image";

interface ProductImageProps {
  productId: number;
  images: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  discount?: number;
  previewImage?: string | null;
}

// Extracted badge components for better maintainability
const DiscountBadge = ({ discount }: { discount: number }) => (
  <div className="absolute top-3 left-3 bg-[#ff5252] text-white text-[10px] font-koulen uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-sm">
    -{discount}%
  </div>
);

const NewBadge = () => (
  <div className="absolute top-3 right-3 bg-[#1e1c15] text-white text-[10px] font-koulen uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-sm">
    NEW
  </div>
);

const BestsellerBadge = () => (
  <div className="absolute top-3 right-3 bg-white text-black text-[10px] font-koulen uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-sm border border-black/10">
    BESTSELLER
  </div>
);

// Memoized to prevent unnecessary re-renders
export default function ProductImage({
  productId,
  images,
  isNew,
  isBestseller,
  discount,
  previewImage,
}: ProductImageProps) {
  // Determine which image to show
  // If previewImage is set (hover on color), use it.
  // Otherwise use the first image from the list.
  const mainImageSrc = previewImage
    ? getImageUrl(previewImage)
    : getImageUrl(images?.[0]) || "/placeholder-product.svg";

  // Only show secondary image hover effect if we are NOT previewing a specific color
  // AND there is a secondary image available.
  const showSecondaryHover = !previewImage && images.length > 1;

  return (
    <div className="relative overflow-hidden">
      <Link href={`/product/${productId}`} className="block">
        <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden relative">
          {/* Primary Image */}
          <Image
            src={mainImageSrc}
            alt={`Product ${productId}`}
            width={500}
            height={650}
            className={`w-full h-80 object-cover object-center transition-opacity duration-500 ease-in-out ${showSecondaryHover ? "group-hover:opacity-0" : ""
              }`}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
          />

          {/* Secondary Image (Hover) - Only render if allowed */}
          {showSecondaryHover && (
            <Image
              src={getImageUrl(images[1])}
              alt={`Product ${productId} - Back`}
              width={500}
              height={650}
              className="absolute inset-0 w-full h-80 object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
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
    </div>
  );
}
