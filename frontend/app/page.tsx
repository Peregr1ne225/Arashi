import { Suspense } from "react";
import ProductGrid from "@/app/components/product/ProductGrid";
import CategorySection from "@/app/components/ui/CategorySection";
import ProductSkeleton from "@/app/components/product/ProductSkeleton";

import { productsApi, categoriesApi } from "@/app/lib/api/client";
import { Product } from "@/app/types";

// --- Async Components for Streaming ---

async function CategoriesFetcher() {
  try {
    const categories = await categoriesApi.getCategories();
    // Randomize categories and take only 8
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffled.slice(0, 8);
    return <CategorySection categories={selectedCategories} />;
  } catch (error) {
    console.warn("Failed to fetch categories:", error);
    return <CategorySection categories={[]} />;
  }
}

async function FeaturedSection() {
  let products: Product[] = [];
  try {
    products = await productsApi.getFeaturedProducts(5);
  } catch (error) {
    console.warn("Failed to fetch featured products:", error);
  }
  return (
    <ProductGrid
      products={products}
      title="Featured Products"
      viewAllLink="/products?sort=featured"
    />
  );
}

async function NewArrivalsSection() {
  let products: Product[] = [];
  try {
    products = await productsApi.getNewArrivals(5);
  } catch (error) {
    console.warn("Failed to fetch new arrivals:", error);
  }
  return (
    <ProductGrid
      products={products}
      title="New Arrivals"
      viewAllLink="/new"
    />
  );
}

async function BestsellersSection() {
  let products: Product[] = [];
  try {
    // Use "bestsellers" ordering which maps to -sold_count in backend
    products = await productsApi.getBestsellers(5);
  } catch (error) {
    console.warn("Failed to fetch bestsellers:", error);
  }
  return (
    <ProductGrid
      products={products}
      title="Bestsellers"
      viewAllLink="/products?sort=bestsellers"
    />
  );
}

async function SaleSection() {
  let products: Product[] = [];
  try {
    products = await productsApi.getSaleProducts(5);
  } catch (error) {
    console.warn("Failed to fetch sale products:", error);
  }
  return (
    <ProductGrid
      products={products}
      title="On Sale"
      viewAllLink="/sale"
    />
  );
}

// --- Main Page Component ---

// Server Component - No "use client" directive
export default function Home() {
  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-12 space-y-24">
        {/* Categories - Streamed */}
        <Suspense fallback={<div className="h-40 bg-secondary animate-pulse m-4 rounded-none"></div>}>
          <CategoriesFetcher />
        </Suspense>

        {/* Featured Products - Streamed */}
        <Suspense fallback={<ProductSkeleton title="Featured Products" />}>
          <FeaturedSection />
        </Suspense>

        {/* New Arrivals - Streamed */}
        <Suspense fallback={<ProductSkeleton title="New Arrivals" />}>
          <NewArrivalsSection />
        </Suspense>

        {/* Bestsellers - Streamed */}
        <Suspense fallback={<ProductSkeleton title="Bestsellers" />}>
          <BestsellersSection />
        </Suspense>

        {/* On Sale - Streamed */}
        <Suspense fallback={<ProductSkeleton title="On Sale" />}>
          <SaleSection />
        </Suspense>

        <div className="h-1"></div>
      </main>
    </div>
  );
}
