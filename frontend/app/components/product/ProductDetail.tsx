"use client";

import Link from "next/link";
import { Product } from "@/app/types";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductActions from "./ProductActions";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {

  const getCategoryName = () => {
    return product.category?.name || "Collection";
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-accent transition-colors">
          Home
        </Link>
        <span className="mx-3 text-white/20">/</span>
        <Link
          href={`/products?category=${product.category?.slug || product.category?.id || ""}`}
          className="hover:text-accent transition-colors"
        >
          {getCategoryName()}
        </Link>
        <span className="mx-3 text-white/20">/</span>
        <span className="text-white truncate">{product.name}</span>
      </nav>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">

        {/* Left Column: Gallery (Sticky on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center">


          <div className="lg:sticky lg:top-24 space-y-8">
            <ProductInfo product={product} />
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      {/* Mobile Spacer for fixed bottom bar */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
