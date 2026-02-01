import { productsApi } from "@/app/lib/api/client";
import ProductDetail from "@/app/components/product/ProductDetail";
import ProductScroll from "@/app/components/product/ProductScroll";
import { Product } from "@/app/types/product";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Server Component - No "use client" directive for better performance
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id);

  let product: Product;
  let relatedProducts: Product[] = [];

  try {
    // Parallel Fetching
    product = await productsApi.getProduct(productId);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
  }

  // Fetch related products (same category)
  try {
    if (product.category_id) {
      const relatedRes = await productsApi.getProducts({
        category: product.category_id,
        page_size: 6, // Fetch extra to exclude self safely
      });
      relatedProducts = relatedRes.results
        .filter((p) => p.id !== productId)
        .slice(0, 5);
    }
  } catch (e) {
    console.warn("Failed to fetch related products:", e);
  }

  return (
    <div className="min-h-screen bg-[#FDFDFB]">
      <main>
        {/* Main Product Detail */}
        <div className="pb-10">
          <ProductDetail product={product} />
        </div>

        {/* Related Products Section */}
        <section className="container mx-auto px-4 md:px-8 py-10 border-t border-gray-100">
          <div className="flex items-center justify-between my-10 border-b border-black/5 pb-4">
            <h2 className="font-koulen text-[32px] md:text-[42px] uppercase tracking-wide text-black leading-none">
              You Might <br className="md:hidden" /> Also Like
            </h2>
          </div>
          {relatedProducts.length > 0 ? (
            <ProductScroll products={relatedProducts} />
          ) : (
            <p className="text-gray-500 italic">
              No related products found in this category.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await productsApi.getProduct(parseInt(id));

    // Construct image list
    const images =
      product.images && product.images.length > 0 ? product.images : [];

    return {
      title: `${product.name} | E-Commerce`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: images,
        type: "website",
      },
      keywords: product.tags,
    };
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}
