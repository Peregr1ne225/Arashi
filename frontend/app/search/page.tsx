import { productsApi } from "@/app/lib/api/client";
import ProductCatalog from "@/app/components/product/ProductCatalog";
import Link from "next/link";
import CatalogDataLoader from "@/app/components/utils/CatalogDataLoader";

// Server Component - No "use client" directive for better performance
interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  // Breadcrumb
  const breadcrumb = (
    <>
      <Link href="/" className="hover:text-gray-900">Home</Link>
      <span className="mx-2">/</span>
      <span className="text-gray-900">Search</span>
    </>
  );

  const productPromise = productsApi.getProducts({
    q: query,
    page_size: 50
  });

  return (
    <CatalogDataLoader productPromise={productPromise}>
      {({ products, categories, count }) => (
        <ProductCatalog
          key={query} // Crucial: Force reset on new search
          initialProducts={products}
          initialCategories={categories}
          initialCount={count}
          fetchMode="search"
          fetchParams={{ q: query }}
          title={query ? `Results for "${query}"` : "Search Products"}
          breadcrumb={breadcrumb}
        />
      )}
    </CatalogDataLoader>
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
