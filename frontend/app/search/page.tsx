
import { productsApi } from "@/app/lib/api/client";
import CatalogLayout from "@/app/components/layout/CatalogLayout";
import ProductCatalog from "@/app/components/product/ProductCatalog";
import Link from "next/link";
// import SearchPageWrapper from "@/app/components/search/SearchPageWrapper"; // Removed

import { Product } from "@/app/types";

// Server Component - No "use client" directive for better performance
interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  // Fetch data
  const response = await productsApi.getProducts({
    q: query,
    page_size: 50
  });

  const products = response.results || [];
  const count = response.count || 0;

  // Breadcrumb
  const breadcrumb = (
    <>
      <Link href="/" className="hover:text-gray-900">Home</Link>
      <span className="mx-2">/</span>
      <span className="text-gray-900">Search</span>
    </>
  );

  return (
    <CatalogLayout
      // Title hidden as per previous request to remove "Search" h1
      // title={query ? `Search Results: ${query}` : "All Products"} 
      description={query ? `Found ${count} results for "${query}"` : "Browse all products"}
      breadcrumb={breadcrumb}
    >
      <ProductCatalog
        key={query} // Crucial: Force reset on new search
        initialProducts={products}
        initialCount={count}
        fetchMode="search"
        fetchParams={{ q: query }}
      />
    </CatalogLayout>
  );
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  return {
    title: query
      ? `Search results for "${query}" | E-Commerce Store`
      : "Search | E-Commerce Store",
    description: query
      ? `Browse search results for "${query}" in our store.`
      : "Search for products in our store.",
  };
}
