import { Suspense } from "react";
import SaleContent from "./SaleContent";
import { productsApi } from "@/app/lib/api/client";
import { ProductListResponse } from "@/app/types";
import CatalogLayout from "@/app/components/layout/CatalogLayout";
import Link from "next/link";

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

  // Breadcrumb
  const breadcrumb = (
    <>
      <Link href="/" className="hover:text-white transition-colors">Home</Link>
      <span className="mx-2 text-accent">/</span>
      <span className="text-white">Sale</span>
    </>
  );

  return (
    <CatalogLayout
      title="Clearance"
      description="Limited Stock // Final Markdowns"
      breadcrumb={breadcrumb}
    >
      <Suspense fallback={<div className="text-white">Loading sale products...</div>}>
        <SaleContent
          initialProducts={initialData.results || []}
          initialCount={initialData.count || 0}
        />
      </Suspense>
    </CatalogLayout>
  );
}
