import { productsApi } from "@/app/lib/api/client";
import ProductCatalog from "@/app/components/product/ProductCatalog";
import Link from "next/link";
import CatalogDataLoader from "@/app/components/utils/CatalogDataLoader";
import ProductSearch from "@/app/components/product/ProductSearch";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
    // Create logic for breadcrumb first as it doesn't need data
    const breadcrumb = (
        <div className="font-istok font-bold text-[12px] tracking-[1px] text-black/60 uppercase">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Products</span>
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
