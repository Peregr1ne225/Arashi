import { Product, ProductCardData, toProductCardData } from "@/app/types/product";
import ProductGridClient from "./ProductGridClient";

// Server component that handles RSC boundary crossing
interface ProductGridProps {
  products: Product[];
  title?: string;
  loading?: boolean;
  viewAllLink?: string;
  layout?: "grid" | "scroll";
}

// This is a server component at the RSC boundary
// It converts full Product objects to minimal ProductCardData
// to reduce serialization overhead when passing to client components
export default function ProductGrid({
  products,
  title,
  loading = false,
  viewAllLink,
  layout = "grid",
}: ProductGridProps) {
  // Convert full Products to minimal ProductCardData at RSC boundary
  // This reduces serialization from ~25+ fields to ~12 fields per product
  const productCardData: ProductCardData[] = products.map(toProductCardData);

  return (
    <ProductGridClient products={productCardData} title={title} loading={loading} viewAllLink={viewAllLink} layout={layout} />
  );
}
