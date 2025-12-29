import { Suspense } from "react";
import NewArrivalsContent from "./NewArrivalsContent";
import { productsApi } from "@/app/lib/api/client";
import { ProductListResponse } from "@/app/types";
import CatalogLayout from "@/app/components/layout/CatalogLayout";
import Link from "next/link";

export const dynamic = "force-dynamic";

// This is a Server Component
export default async function NewArrivalsPage() {
  // Fetch initial data on the server
  // We can replicate the default params used in the client component
  let initialData: ProductListResponse = { results: [], count: 0, next: null, previous: null };

  try {
    initialData = await productsApi.getProducts({
      is_new: true,
      page: 1,
      page_size: 12,
      ordering: "-created_at"
    });
  } catch (error) {
    console.warn("Failed to fetch new arrivals (likely during build):", error);
  }

  // Breadcrumb
  const breadcrumb = (
    <>
      <Link href="/" className="hover:text-white transition-colors">Home</Link>
      <span className="mx-2 text-accent">/</span>
      <span className="text-white">New Arrivals</span>
    </>
  );

  return (
    <CatalogLayout
      title="New Drops"
      description="Fresh Gear // Just Landed"
      breadcrumb={breadcrumb}
    >
      <Suspense fallback={<div className="text-white">Loading new arrivals...</div>}>
        <NewArrivalsContent
          initialProducts={initialData.results || []} // Ensure array
          initialCount={initialData.count || 0}
        />
      </Suspense>
    </CatalogLayout>
  );
}
