
import { productsApi } from "@/app/lib/api/client";
import CatalogLayout from "@/app/components/layout/CatalogLayout";
import ProductCatalog from "@/app/components/product/ProductCatalog";
import Link from "next/link";

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

import { ProductListResponse } from "@/app/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: PageProps) {
    // Fetch data
    let response: ProductListResponse = { results: [], count: 0, next: null, previous: null };
    try {
        response = await productsApi.getProducts({ page_size: 50 });
    } catch (error) {
        console.warn("Failed to fetch products (likely during build):", error);
    }

    const products = response.results || [];
    const count = response.count || 0;

    const breadcrumb = (
        <>
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Products</span>
        </>
    );

    return (
        <CatalogLayout
            title="All Products"
            description="Browse our collection of high-quality products."
            breadcrumb={breadcrumb}
        >
            <ProductCatalog
                initialProducts={products}
                initialCount={count}
                fetchMode="products"
            />
        </CatalogLayout>
    );
}
