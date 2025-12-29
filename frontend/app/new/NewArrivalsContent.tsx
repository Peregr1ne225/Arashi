"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductGrid from "@/app/components/product/ProductGrid";
import SidebarFilters from "@/app/components/ui/sidebar/SidebarFilters";
import { productsApi } from "@/app/lib/api/client";
import { Product } from "@/app/types";

interface NewArrivalsContentProps {
    initialProducts: Product[];
    initialCount: number;
}

export default function NewArrivalsContent({ initialProducts, initialCount }: NewArrivalsContentProps) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialProducts.length < initialCount); // Basic check
    const [total, setTotal] = useState(initialCount);

    // Filters state
    const [currentFilters, setCurrentFilters] = useState({
        category: "",
        minPrice: 0,
        maxPrice: 3000,
        sortBy: "newest",
    });

    const fetchProducts = async (pageNum: number, isReset: boolean, filters = currentFilters) => {
        if (isReset) {
            setLoading(true);
            // Don't clear products immediately if we are just refetching to avoid flicker, 
            // but for logic consistency in infinite scroll usually we do.
            // For SSR transition: we might want to keep showing old products until new ones load?
            // For now let's stick to standard behavior: clear if reset.
            setProducts([]);
        } else {
            setLoading(true);
        }

        try {
            const params: any = {
                is_new: true,
                page: pageNum,
                page_size: 12,
            };

            // Map sortBy from SidebarFilters to API ordering
            switch (filters.sortBy) {
                case "price-low-high":
                    params.ordering = "price";
                    break;
                case "price-high-low":
                    params.ordering = "-price";
                    break;
                case "rating":
                    params.ordering = "-rating";
                    break;
                case "bestsellers":
                    params.ordering = "-sold_count";
                    break;
                case "newest":
                default:
                    params.ordering = "-created_at";
                    break;
            }

            if (filters.category) {
                params.category_slug = filters.category.toLowerCase();
            }

            if (filters.maxPrice < 1000) {
                params.max_price = filters.maxPrice;
            }

            if (filters.minPrice > 0) {
                params.min_price = filters.minPrice;
            }

            const response = await productsApi.getProducts(params);

            // Use map to ensure any transformations if needed, client.ts usually returns Product[] so assuming it matches
            const newProducts = response.results as Product[];

            if (isReset) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }

            setTotal(response.count);
            setHasMore(response.next !== null);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to fetch new arrivals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchProducts(page + 1, false, currentFilters);
        }
    };

    const handleFiltersChange = (newFilters: any) => {
        setCurrentFilters(newFilters);
        // Reset page to 1 when filters change
        fetchProducts(1, true, newFilters);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <SidebarFilters
                onFiltersChange={handleFiltersChange}
                initialFilters={{
                    category: "",
                    minPrice: 0,
                    maxPrice: 3000,
                    sortBy: "newest"
                }}
            />

            {/* Products */}
            <div className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Full Roster</h2>
                    <div className="flex items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-accent mr-2">
                            {total} units
                        </span>
                    </div>
                </div>

                {/* Product Grid */}
                <ProductGrid products={products} loading={loading && page === 1} />

                {/* Load More */}
                {hasMore && products.length > 0 && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="px-8 py-3 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] text-sm disabled:opacity-50"
                        >
                            {loading ? "LOADING..." : "LOAD MORE"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
