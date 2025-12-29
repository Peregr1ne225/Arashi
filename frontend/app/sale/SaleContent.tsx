"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductGrid from "@/app/components/product/ProductGrid";
import SidebarFilters from "@/app/components/ui/sidebar/SidebarFilters";
import { productsApi } from "@/app/lib/api/client";
import { Product } from "@/app/types";

interface SaleContentProps {
    initialProducts: Product[];
    initialCount: number;
}

export default function SaleContent({ initialProducts, initialCount }: SaleContentProps) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialProducts.length < initialCount);
    const [total, setTotal] = useState(initialCount);

    // Filters
    const [currentFilters, setCurrentFilters] = useState({
        category: "",
        minPrice: 0,
        maxPrice: 3000,
        sortBy: "newest", // Or "discount-high-low" if preferred as default often for sales
    });

    const fetchProducts = async (pageNum: number, isReset: boolean, filters = currentFilters) => {
        if (isReset) {
            setLoading(true);
            setProducts([]);
        } else {
            setLoading(true);
        }

        try {
            const params: any = {
                is_sale: true,
                page: pageNum,
                page_size: 12,
            };

            // Map sortBy
            switch (filters.sortBy) {
                case "price-low-high":
                    params.ordering = "price";
                    break;
                case "price-high-low":
                    params.ordering = "-price";
                    break;
                case "discount-high-low":
                    params.ordering = "-discount";
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
            console.error("Failed to fetch sale products", error);
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
                    sortBy: "newest" // Or "discount-high-low"
                }}
            />

            {/* Products */}
            <div className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-4">
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Sale Items</h1>
                    <div className="flex items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-accent mr-2">
                            {total} units
                        </span>
                        {/* Removed duplicate sort dropdown */}
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
