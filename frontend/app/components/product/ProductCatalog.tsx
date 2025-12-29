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
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="w-full py-3 bg-white border border-gray-200 rounded-lg shadow-sm font-medium flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filters & Sort
                </button>
            </div>

            {/* Sidebar - Desktop & Mobile Drawer */}
            <div className={`
                fixed inset-0 z-50 bg-black/50 transition-opacity lg:static lg:bg-transparent lg:z-auto lg:block
                ${isMobileFiltersOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}
            `}>
                <div className={`
                    absolute inset-y-0 left-0 w-[80%] max-w-xs bg-white shadow-xl transform transition-transform duration-300 lg:static lg:transform-none lg:w-64 lg:shadow-none lg:bg-transparent
                    ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex justify-between items-center p-4 border-b lg:hidden">
                        <span className="font-semibold text-lg">Filters</span>
                        <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 lg:p-0 overflow-y-auto h-full lg:h-auto">
                        <SidebarFilters
                            onFiltersChange={(f) => {
                                handleFiltersChange(f);
                                // Optional: close drawer on apply, or let user close manually
                                // setIsMobileFiltersOpen(false); 
                            }}
                            initialFilters={getInitialFilters()}
                            currentCategory={initialCategorySlug}
                            availableCategoryIds={availableCategoryIds}
                            maxPrice={sliderMax}
                        />
                    </div>
                </div>

                {/* Overlay click to close */}
                <div onClick={() => setIsMobileFiltersOpen(false)} className="absolute inset-0 lg:hidden"></div>
            </div>

            {/* Grid Area with Overlay Loading */}
            <div className="flex-1 relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 z-50 flex justify-center items-start pt-32 backdrop-blur-[1px] transition-all duration-200">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neutral-900 shadow-lg"></div>
                    </div>
                )}

                {error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => fetchProducts(getInitialFilters())}
                            className="px-4 py-2 bg-neutral-900 text-white rounded"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>

                        {products.length > 0 ? (
                            <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
                                <ProductGrid products={products} />
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                No products found.
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
