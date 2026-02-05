import ProductCatalog from "@/app/components/product/ProductCatalog";
import { productsApi } from "@/app/lib/api/client";
import CatalogDataLoader from "@/app/components/utils/CatalogDataLoader";
import Link from "next/link";
import ProductSearch from "@/app/components/product/ProductSearch";

export const dynamic = "force-dynamic";

export default function SalePage() {
  const productPromise = productsApi.getProducts({
    is_sale: true,
    page_size: 50,
    ordering: "-created_at"
  });

  const breadcrumb = (
    <div className="font-istok font-bold text-[12px] tracking-[1px] text-black/60 uppercase">
      <Link href="/" className="hover:text-black transition-colors">Home</Link>
      <span className="mx-2">/</span>
      <span className="text-black">Sale</span>
    </div>
  );

  return (
    <CatalogDataLoader productPromise={productPromise}>
      {({ products, categories, count }) => (
        <ProductCatalog
          initialProducts={products}
          initialCategories={categories}
          initialCount={count}
          fetchMode="products"
          fetchParams={{ is_sale: true, ordering: "-created_at" }}
          title="Sale"
          breadcrumb={breadcrumb}
          headerContent={<ProductSearch />}
        />
      )}
    </CatalogDataLoader>
  );
}
