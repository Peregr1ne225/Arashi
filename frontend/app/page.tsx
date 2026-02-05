import { Suspense } from "react";
import ProductGrid from "@/app/components/product/ProductGrid";
import ProductSkeleton from "@/app/components/product/ProductSkeleton";
import HeroSection from "@/app/components/home/HeroSection";
import { productsApi } from "@/app/lib/api/client";
import { Product } from "@/app/types/product";
import { cmsApi } from "@/app/lib/api/client";

// --- Async Components for Streaming ---
async function HeroSectionFetcher() {
  let heroImages: string[] = [];

  try {
    const heroData = await cmsApi.getHeroImages(true);
    if (heroData?.length > 0) {
      heroImages = heroData.map((img) => img.image);
    }
  } catch (error) {
    console.warn("Failed to fetch hero images:", error);
  }

  if (heroImages.length === 0) {
    // Fallback
    heroImages = [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
    ];
  }

  return <HeroSection heroImages={heroImages} />;
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
      {/* Hero Section - Streamed (Full Width) */}
      <Suspense
        fallback={<div className="h-150 bg-gray-100 animate-pulse" />}
      >
        <HeroSectionFetcher />
      </Suspense>

      <main className="container mx-auto px-4 md:px-8 py-8 space-y-4">
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
