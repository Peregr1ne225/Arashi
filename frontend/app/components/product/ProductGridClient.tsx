"use client";

import ProductCard from "./ProductCard";
import { Product } from "@/app/types";
import ProductSkeleton from "./ProductSkeleton";

interface ProductGridClientProps {
  products: Product[];
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-sm text-gray-600 hover:underline">
              View All →
            </a>
          )}
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
          <h3 className="text-xl font-medium text-black mb-2">
            No products found
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            We couldn&apos;t find any products matching your criteria. Try
            adjusting your filters or browse our featured products.
          </p>
        </div>
      )}
    </div>
  );
}
