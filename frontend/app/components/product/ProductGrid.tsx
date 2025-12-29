import { Product } from "@/app/types";
import ProductGridClient from "./ProductGridClient";

// Server component that fetches data and passes it to the client component
interface ProductGridProps {
  products: Product[];
  title?: string;
  loading?: boolean;
  viewAllLink?: string;
}

// This is a server component that handles data fetching
// and passes the data to the client component
export default function ProductGrid({
  products,
  title,
  loading = false,
  viewAllLink,
}: ProductGridProps) {
  // Any server-side data processing can happen here
  // For now, we're just passing the props directly to the client component

  return (
    <ProductGridClient products={products} title={title} loading={loading} viewAllLink={viewAllLink} />
  );
}
