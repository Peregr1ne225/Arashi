import { productsApi } from "@/app/lib/api/client";
import ProductDetail from "@/app/components/product/ProductDetail";
import ProductScroll from "@/app/components/product/ProductScroll";
import { Product } from "@/app/types/product";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

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
    <div className="min-h-screen bg-white pb-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="w-full py-4 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="px-6 py-2 rounded-full border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0e4d80] animate-pulse"></div>
              <span className="font-koulen text-[14px] text-[#0e4d80] uppercase tracking-[0.2em]">
                Shop
              </span>
            </div>
          </div>
          <h1 className="font-koulen text-[64px] md:text-[96px] leading-[0.9] text-[#0e4d80] mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
            Product <span className="text-gray-300">Details</span>
          </h1>
        </div>
      </div>

      {/* Main Content Card Container */}
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-8 pl-4">
          {/* TODO: Update href to /products or wherever the shop list is */}
          <Link
            href="/products"
            className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#0e4d80] font-body transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Shop
          </Link>
        </div>

        <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 p-8 border border-gray-100 relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0e4d80]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            {/* Main Product Detail */}
            <ProductDetail product={product} />

            {/* Related Products Section */}
            <div className="mt-20 border-t border-gray-100 pt-16">
              <div className="flex items-center justify-between mb-10 px-4">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full bg-[#0e4d80] text-white flex items-center justify-center text-lg font-koulen shadow-lg shadow-blue-900/20">
                    !
                  </span>
                  <h2 className="font-koulen text-[32px] md:text-[42px] uppercase tracking-wide text-[#0e4d80] leading-none">
                    You Might Also Like
                  </h2>
                </div>
              </div>
              {relatedProducts.length > 0 ? (
                <ProductScroll products={relatedProducts} />
              ) : (
                <p className="text-gray-400 font-istok font-bold uppercase tracking-widest text-xs text-center">
                  No related products found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
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
