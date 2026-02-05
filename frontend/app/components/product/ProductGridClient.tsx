"use client";

import { ProductCardData } from "@/app/types/product";
import ProductSkeleton from "./ProductSkeleton";
import ProductScroll from "./ProductScroll";

interface ProductGridClientProps {
  products: ProductCardData[];
  title?: string;
  loading?: boolean;
  viewAllLink?: string;
}

export default function ProductGridClient({
  products,
  title,
  loading = false,
  viewAllLink,
}: ProductGridClientProps) {
  // Loading state placeholder
  if (loading) {
    return <ProductSkeleton title={title} />;
  }

  return (
    <div className="w-full">
      {title && (
        <div className="flex justify-between items-end border-b border-black/5 pb-4">
          <h2 className="text-[32px] font-display uppercase tracking-wide text-foreground leading-none">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-sm font-body font-bold uppercase tracking-wider text-gray-500 hover:text-primary-dark hover:underline underline-offset-4 transition-all">
              View All
            </a>
          )}
        </div>
      )}

      {products.length > 0 ? (
        <ProductScroll products={products} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-2xl font-koulen tracking-wide text-black mb-2 uppercase">
            No products found
          </h3>
          <p className="font-istok text-gray-500 text-center max-w-md">
            We couldn&apos;t find any products matching your criteria. Try
            adjusting your filters or browse our featured products.
          </p>
        </div>
      )}
    </div>
  );
}
