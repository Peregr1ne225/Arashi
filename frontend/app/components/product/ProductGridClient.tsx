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
        <div className="flex justify-between items-end mb-8 border-b-2 border-accent pb-2">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors mb-1">
              View All //
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
        <div className="flex flex-col items-center justify-center py-24 border border-white/10 skew-box bg-neutral-900/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-accent mb-6 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-3">
            No Gear Found
          </h3>
          <p className="text-gray-400 text-center max-w-md font-bold uppercase tracking-wide">
            We couldn&apos;t find what you&apos;re looking for. <br />
            Check your filters or <span className="text-accent cursor-pointer hover:underline">reset search</span>.
          </p>
        </div>
      )}
    </div>
  );
}
