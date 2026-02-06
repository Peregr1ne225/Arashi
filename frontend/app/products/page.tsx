import { productsApi } from "@/app/lib/api/client";
import ProductCatalog from "@/app/components/product/ProductCatalog";
import Link from "next/link";
import CatalogDataLoader from "@/app/components/utils/CatalogDataLoader";
import ProductSearch from "@/app/components/product/ProductSearch";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
    // Create logic for breadcrumb first as it doesn't need data
    const breadcrumb = (
        <div className="font-body font-bold text-[10px] tracking-[0.2em] text-gray-400 uppercase">
            <Link href="/" className="hover:text-[#0e4d80] transition-colors border-b border-transparent hover:border-[#0e4d80]">Home</Link>
            <span className="mx-3 text-gray-300">/</span>
            <span className="text-[#0e4d80]">Products</span>
        </div>
    );

    const productPromise = productsApi.getProducts({ page_size: 50 });

    return (
        <CatalogDataLoader productPromise={productPromise}>
            {({ products, categories, count }) => (
                <ProductCatalog
                    initialProducts={products}
                    initialCategories={categories}
                    initialCount={count}
                    fetchMode="products"
                    title="All Products"
                    breadcrumb={breadcrumb}
                    headerContent={
                        <ProductSearch />
                    }
                />
            )}
        </CatalogDataLoader>
    );
}
