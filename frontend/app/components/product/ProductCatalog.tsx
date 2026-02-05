"use client";

import {
    Suspense,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from "react";
import SidebarFilters from "@/app/components/ui/sidebar/SidebarFilters";
import CatalogLayout from "@/app/components/layout/CatalogLayout";
import ProductGrid from "@/app/components/product/ProductGrid";
import ProductSkeleton from "@/app/components/product/ProductSkeleton";
import { Product } from "@/app/types/product";
import { Category } from "@/app/types/category";
import { productsApi } from "@/app/lib/api/client";

interface FilterState {
    category: string;
    minPrice: number;
    maxPrice: number;
    sortBy: string;
    [key: string]: string | number | boolean | undefined;
}

interface ProductCatalogProps {
    initialProducts: Product[];
    initialCategories: Category[];
    initialCount: number;
    fetchMode: "products" | "search" | "category";
    fetchParams?: {
        q?: string;
        category_slug?: string;
        category_id?: number | string;
        [key: string]: string | number | boolean | undefined;
    };
    title?: string;
    breadcrumb?: React.ReactNode;
    headerContent?: React.ReactNode;
}

function ProductCatalogContent({
    initialProducts,
    initialCategories,
    initialCount,
    fetchMode,
    fetchParams = {},
    title,
    breadcrumb,
    headerContent,
}: ProductCatalogProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [totalCount, setTotalCount] = useState<number>(initialCount);
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine current category slug safely
    const initialCategorySlug =
        fetchMode === "category" ? fetchParams.category_slug || "" : "";

    // Memoize initial filters so they are stable across renders
    const initialFilters = useMemo(
        () => ({
            category: initialCategorySlug,
            minPrice: 0,
            maxPrice: 0,
            sortBy: "featured",
        }),
        [initialCategorySlug],
    );
    const [currentFilters, setCurrentFilters] = useState(initialFilters);
    const hasMounted = useRef(false);

    // Calculate initial max from props to avoid flash of 1000
    const initialMax = useMemo(() => {
        return initialProducts.length > 0
            ? Math.ceil(Math.max(...initialProducts.map((p) => p.price)))
            : 1000;
    }, [initialProducts]);

    const [sliderMax, setSliderMax] = useState(initialMax);

    // Deeply memoize fetchParams to avoid loops if parent passes a literal object
    const memoizedFetchParams = useMemo(
        () => ({
            q: fetchParams?.q,
            category_slug: fetchParams?.category_slug,
            category_id: fetchParams?.category_id,
            is_new: fetchParams?.is_new,
            ordering: fetchParams?.ordering,
            category: fetchParams?.category,
            page_size: fetchParams?.page_size,
        }),
        [
            fetchParams?.q,
            fetchParams?.category_slug,
            fetchParams?.category_id,
            fetchParams?.is_new,
            fetchParams?.ordering,
            fetchParams?.category,
            fetchParams?.page_size,
        ],
    );

    // Set hasMounted to true after first render
    useEffect(() => {
        hasMounted.current = true;
    }, []);

    // Fetch accurate max price and available categories from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const params: Record<string, string | number | boolean | undefined> = {
                    active_only: true,
                };

                // Add current context filters (category/search) but NOT price filters
                if (fetchMode === "category") {
                    if (memoizedFetchParams.category_slug)
                        params.category_slug = memoizedFetchParams.category_slug;
                    if (memoizedFetchParams.category_id)
                        params.category = memoizedFetchParams.category_id;
                } else if (fetchMode === "search" && memoizedFetchParams.q) {
                    params.q = memoizedFetchParams.q;
                }

                const stats = await productsApi.getProductStats(params);
                if (stats) {
                    if (stats.max_price) {
                        setSliderMax(Math.ceil(stats.max_price));
                    }
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };
        fetchStats();
    }, [fetchMode, memoizedFetchParams]);

    // Function to fetch products
    const fetchProducts = useCallback(
        async (
            filters: FilterState,
            pageNum: number = 1,
            append: boolean = false,
        ) => {
            setIsLoading(true);
            setError(null);

            // Base params
            const apiParams: Record<string, string | number | boolean | undefined> = {
                page: pageNum,
                active_only: true,
                ...memoizedFetchParams,
            };

            // Ensure default page_size if not provided
            if (apiParams.page_size === undefined) {
                apiParams.page_size = 50;
            }

            // Apply Filters
            if (filters.category) {
                // User selected specific category
                apiParams.category_slug = filters.category;
                delete apiParams.category;
                delete apiParams.category_id;
            } else if (fetchMode === "category" && memoizedFetchParams.category_id) {
                // Fallback to page context category
                apiParams.category = memoizedFetchParams.category_id;
            }

            if (filters.minPrice > 0) apiParams.min_price = filters.minPrice;

            if (filters.maxPrice > 0 && filters.maxPrice < sliderMax) {
                apiParams.max_price = filters.maxPrice;
            }

            // Sorting
            switch (filters.sortBy) {
                case "price-low-high":
                    apiParams.ordering = "final_price";
                    break;
                case "price-high-low":
                    apiParams.ordering = "-final_price";
                    break;
                case "newest":
                    apiParams.ordering = "-created_at";
                    break;
                case "rating":
                    apiParams.ordering = "-rating";
                    break;
                case "bestsellers":
                    apiParams.ordering = "-sold_count";
                    break;
                case "featured":
                default:
                    apiParams.ordering = "-created_at";
                    break;
            }

            try {
                const response = await productsApi.getProducts(apiParams);

                const finalResults = response.results || [];
                const finalCount = response.count || 0;

                if (append) {
                    setProducts((prev) => [...prev, ...finalResults]);
                } else {
                    setProducts(finalResults);
                }

                setTotalCount(finalCount);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load products";
                console.error("Error fetching products:", err);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        },
        [fetchMode, memoizedFetchParams, sliderMax],
    );

    // Handle filter changes
    const handleFiltersChange = useCallback(
        (filters: FilterState) => {
            // Skip first fetch if we already have initial products
            if (!hasMounted.current) {
                setCurrentFilters(filters);
                return;
            }

            setPage(1);
            setCurrentFilters(filters);
            fetchProducts(filters, 1, false);
        },
        [fetchProducts],
    );

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(currentFilters, nextPage, true);
    };

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    return (
        <CatalogLayout
            title={title}
            breadcrumb={breadcrumb}
            headerContent={headerContent}
            sidebar={
                <SidebarFilters
                    onFiltersChange={handleFiltersChange}
                    initialFilters={initialFilters}
                    currentCategory={initialCategorySlug}
                    maxPrice={sliderMax}
                    categories={initialCategories}
                />
            }
        >
            <div className="flex flex-col lg:flex-row lg:gap-12">
                {/* Mobile Filter Button - Styled for Arashi */}
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="w-full py-4 bg-[#0e4d80] text-white rounded-full font-koulen text-[18px] tracking-wide flex items-center justify-center gap-2 uppercase hover:bg-[#0a3a60] shadow-lg transition-all"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                        </svg>
                        Filter & Sort
                    </button>
                </div>

                {/* Mobile Drawer (SidebarFilters reused) */}
                <div
                    className={`
                    fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden
                    ${isMobileFiltersOpen ? "opacity-100 visible" : "opacity-0 invisible"}
                `}
                >
                    <div
                        className={`
                        absolute inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl transform transition-transform duration-300 rounded-r-4xl overflow-hidden
                        ${isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <span className="font-koulen text-2xl uppercase tracking-wide text-black">Filters</span>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg
                                    className="w-6 h-6 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto h-full">
                            <SidebarFilters
                                onFiltersChange={handleFiltersChange}
                                initialFilters={initialFilters}
                                currentCategory={initialCategorySlug}
                                maxPrice={sliderMax}
                                categories={initialCategories}
                            />
                        </div>
                    </div>
                    {/* Overlay click to close */}
                    <div
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="absolute inset-0 text-transparent"
                    >
                        close
                    </div>
                </div>

                {/* Grid Area with Overlay Loading */}
                <div className="flex-1 relative min-h-100">
                    {isLoading && (
                        <div className="absolute inset-0 bg-[#FDFDFB]/80 z-40 flex justify-center items-start pt-32 backdrop-blur-[2px] transition-all duration-200">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0e4d80] shadow-lg"></div>
                        </div>
                    )}

                    {error ? (
                        <div className="text-center py-16">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={() => fetchProducts(initialFilters)}
                                className="px-6 py-2 bg-[#0e4d80] text-white rounded-full font-koulen tracking-wider uppercase hover:bg-[#0a3a60] transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {products.length > 0 ? (
                                <div
                                    className={`transition-opacity duration-200 ${isLoading && page === 1 ? "opacity-40" : "opacity-100"}`}
                                >
                                    <ProductGrid products={products} />

                                    {/* Load More Button */}
                                    {products.length < totalCount && (
                                        <div className="flex justify-center mt-12 mb-8">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={isLoading}
                                                className="px-10 py-3 bg-white border border-gray-200 text-[#0e4d80] font-koulen text-[16px] tracking-wider uppercase hover:bg-[#0e4d80] hover:text-white hover:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-50 rounded-full shadow-md hover:shadow-lg transform active:scale-95"
                                            >
                                                {isLoading ? "Loading..." : "Load More"}
                                            </button>
                                        </div>
                                    )}
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
        </CatalogLayout>
    );
}

// Export a Suspense-wrapped version by default
export default function ProductCatalog(props: ProductCatalogProps) {
    return (
        <Suspense
            fallback={
                <div className="pt-20">
                    <ProductSkeleton />
                </div>
            }
        >
            <ProductCatalogContent {...props} />
        </Suspense>
    );
}
