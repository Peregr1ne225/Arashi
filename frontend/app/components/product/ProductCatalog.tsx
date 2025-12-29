"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import SidebarFilters from "@/app/components/ui/sidebar/SidebarFilters";
import ProductGrid from "@/app/components/product/ProductGrid";
import { Product } from "@/app/types";
import { productsApi } from "@/app/lib/api/client";
import { useSearchParams, useRouter } from "next/navigation";

interface ProductCatalogProps {
    initialProducts: Product[];
    initialCount: number;
    fetchMode: 'products' | 'search' | 'category';
    fetchParams?: {
        q?: string;
        category_slug?: string;
        category_id?: number | string;
        [key: string]: any;
    };
}

function ProductCatalogContent({
    initialProducts,
    initialCount,
    fetchMode,
    fetchParams = {},
}: ProductCatalogProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [count, setCount] = useState<number>(initialCount);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Determine current category slug safely
    const initialCategorySlug = fetchMode === 'category' ? (fetchParams.category_slug || "") : "";

    // Get initial filters from URL or defaults
    const getInitialFilters = () => ({
        category: initialCategorySlug,
        minPrice: Number(searchParams.get("minPrice")) || 0,
        maxPrice: Number(searchParams.get("maxPrice")) || 0,
        sortBy: searchParams.get("sortBy") || "featured",
    });

    // Calculate initial max from props to avoid flash of 1000
    const initialMax = initialProducts.length > 0
        ? Math.ceil(Math.max(...initialProducts.map(p => p.price)))
        : 1000;

    const [sliderMax, setSliderMax] = useState(initialMax);
    const [availableCategoryIds, setAvailableCategoryIds] = useState<number[] | undefined>(undefined);

    // Fetch accurate max price and available categories from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const params: any = { active_only: true };

                // Add current context filters (category/search) but NOT price filters
                if (fetchMode === 'category') {
                    if (fetchParams.category_slug) params.category_slug = fetchParams.category_slug;
                    if (fetchParams.category_id) params.category = fetchParams.category_id;
                } else if (fetchMode === 'search' && fetchParams.q) {
                    params.q = fetchParams.q;
                }

                const stats = await productsApi.getProductStats(params);
                if (stats) {
                    if (stats.max_price) {
                        setSliderMax(Math.ceil(stats.max_price));
                    }
                    if (stats.category_ids) {
                        setAvailableCategoryIds(stats.category_ids);
                    }
                } else {
                    // Fallback...
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        }
        fetchStats();
    }, [fetchMode, JSON.stringify(fetchParams)]);

    // Function to fetch products
    const fetchProducts = async (
        filters: {
            category: string;
            minPrice: number;
            maxPrice: number;
            sortBy: string;
        }
    ) => {
        setIsLoading(true);
        setError(null);

        // Base params
        const apiParams: Record<string, any> = {
            page_size: 50,
            active_only: true,
            ...fetchParams,
        };

        // Apply Filters
        if (filters.category) {
            // User selected specific category
            apiParams.category_slug = filters.category;
            delete apiParams.category;
            delete apiParams.category_id;
        } else if (fetchMode === 'category' && fetchParams.category_id) {
            // Fallback to page context category
            apiParams.category = fetchParams.category_id;
        }

        if (filters.minPrice > 0) apiParams.min_price = filters.minPrice;

        if (filters.maxPrice > 0 && filters.maxPrice < sliderMax) {
            apiParams.max_price = filters.maxPrice;
        }

        // Sorting
        switch (filters.sortBy) {
            case "price-low-high": apiParams.ordering = "final_price"; break;
            case "price-high-low": apiParams.ordering = "-final_price"; break;
            case "newest": apiParams.ordering = "-created_at"; break;
            case "rating": apiParams.ordering = "-rating"; break;
            case "bestsellers": apiParams.ordering = "-sold_count"; break;
            case "featured":
            default:
                apiParams.ordering = "-created_at";
                break;
        }

        try {
            // Enforce a minimum loading time of 400ms so the user sees the overlay interaction
            // This prevents "flicker" where it looks like nothing happened
            const minDelay = new Promise(resolve => setTimeout(resolve, 400));

            const [response] = await Promise.all([
                productsApi.getProducts(apiParams),
                minDelay
            ]);

            let finalResults = response.results || [];
            let finalCount = response.count || 0;

            setProducts(finalResults);
            setCount(finalCount);

        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError(err.message || "Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle filter changes
    const handleFiltersChange = (filters: any) => {
        // Always fetch when filters change
        fetchProducts(filters);
    };

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-8">
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="w-full py-4 bg-accent border border-black text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 skew-box hover:bg-white transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filters & Sort //
                </button>
            </div>

            {/* Sidebar - Desktop & Mobile Drawer */}
            <div className={`
                fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity lg:static lg:bg-transparent lg:z-auto lg:block
                ${isMobileFiltersOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}
            `}>
                <div className={`
                    absolute inset-y-0 left-0 w-[85%] max-w-xs bg-neutral-900 border-r border-white/10 shadow-2xl transform transition-transform duration-300 lg:static lg:transform-none lg:w-64 lg:shadow-none lg:bg-transparent lg:border-none
                    ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex justify-between items-center p-6 border-b border-white/10 lg:hidden">
                        <span className="font-black uppercase italic tracking-tighter text-white text-2xl">Filters</span>
                        <button onClick={() => setIsMobileFiltersOpen(false)} className="text-white hover:text-accent p-2 transition-colors">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 lg:p-0 overflow-y-auto h-full lg:h-auto">
                        <SidebarFilters
                            onFiltersChange={(f) => {
                                handleFiltersChange(f);
                                // Optional: close drawer on apply
                            }}
                            initialFilters={getInitialFilters()}
                            currentCategory={initialCategorySlug}
                            availableCategoryIds={availableCategoryIds}
                            maxPrice={sliderMax}
                        />
                    </div>
                </div>

                {/* Overlay click to close */}
                <div onClick={() => setIsMobileFiltersOpen(false)} className="absolute inset-0 lg:hidden -z-10"></div>
            </div>

            {/* Grid Area with Overlay Loading */}
            <div className="flex-1 relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-neutral-900/80 z-50 flex justify-center items-start pt-32 backdrop-blur-sm transition-all duration-200">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-accent shadow-[0_0_20px_rgba(204,255,0,0.5)]"></div>
                            <span className="text-accent font-bold uppercase tracking-widest animate-pulse">Scouting Gear...</span>
                        </div>
                    </div>
                )}

                {error ? (
                    <div className="text-center py-20 border border-red-900/50 bg-red-900/10 skew-box">
                        <p className="text-red-500 mb-6 font-bold uppercase tracking-wider">{error}</p>
                        <button
                            onClick={() => fetchProducts(getInitialFilters())}
                            className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest hover:bg-accent transition-colors skew-box"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {products.length > 0 ? (
                            <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-20' : 'opacity-100'}`}>
                                <ProductGrid products={products} />
                            </div>
                        ) : (
                            <div className="text-center py-24 text-gray-500 border border-white/10 bg-white/5 skew-box">
                                <div className="mb-4 text-4xl opacity-50">🔍</div>
                                <h3 className="text-xl font-black uppercase italic tracking-wider text-white mb-2">No Gear Found</h3>
                                <p className="text-sm font-medium uppercase tracking-wide">Adjust your filters to find what you need.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Export a Suspense-wrapped version by default
export default function ProductCatalog(props: ProductCatalogProps) {
    return (
        <Suspense fallback={<div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div></div>}>
            <ProductCatalogContent {...props} />
        </Suspense>
    );
}
