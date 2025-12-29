import { Suspense } from "react";
import SaleContent from "./SaleContent";
import { productsApi } from "@/app/lib/api/client";

import { ProductListResponse } from "@/app/types";

export const dynamic = "force-dynamic";

export default async function SalePage() {
  // Fetch initial data on the server
  let initialData: ProductListResponse = { results: [], count: 0, next: null, previous: null };
  try {
    initialData = await productsApi.getProducts({
      is_sale: true,
      page: 1,
      page_size: 12,
      ordering: "-created_at"
    });
  } catch (error) {
    console.warn("Failed to fetch sale products (likely during build):", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-gray-900">
            Home
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Sale</span>
        </div>

        <Suspense fallback={<div>Loading sale products...</div>}>
          <SaleContent
            initialProducts={initialData.results || []}
            initialCount={initialData.count || 0}
          />
        </Suspense>
      </main>
    </div>
  );
}
