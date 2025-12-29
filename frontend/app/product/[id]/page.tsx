import { productsApi } from "@/app/lib/api/client";
import ProductDetail from "@/app/components/product/ProductDetail";

import { notFound } from "next/navigation";
import { Metadata } from "next";

// Server Component - No "use client" directive for better performance
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params to get the id
  const { id } = await params;

  // Fetch product data with caching
  try {
    const product = await productsApi.getProduct(parseInt(id));

    return (
      <div className="min-h-screen bg-background text-white">

        <main className="container mx-auto px-4 py-12">
          {/* Refactored Product Detail Component */}
          <ProductDetail product={product} />
        </main>

      </div>
    );
  } catch (error) {
    // If product is not found or any other error occurs
    console.error(`Failed to fetch product ${id}:`, error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // Unwrap params to get the id
  const { id } = await params;

  try {
    const product = await productsApi.getProduct(parseInt(id));

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.image ? [product.image] : [],
      },
    };
  } catch (error) {
    console.error(`Failed to generate metadata for product ${id}:`, error);
    return {
      title: "Product Not Found",
    };
  }
}
