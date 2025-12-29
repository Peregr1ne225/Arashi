import { useState, useEffect, useCallback } from "react";
import { Product, SearchParams } from "@/app/types";

interface UseProductsOptions {
  initialQuery?: string;
  initialFilters?: Partial<SearchParams>;
  autoFetch?: boolean;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  query: string;
  filters: SearchParams;
  search: (searchQuery: string, searchFilters?: Partial<SearchParams>) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchParams>) => void;
}

export function useProducts({
  initialQuery = "",
  initialFilters = {},
  autoFetch = true,
}: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQueryState] = useState(initialQuery);
  const [filters, setFiltersState] = useState<SearchParams>({
    page: 1,
    page_size: 20,
    ...initialFilters,
  });

  // Build URL with search parameters
  const buildUrl = useCallback(
    (searchQuery: string, searchFilters: Partial<SearchParams>): string => {
      const params = new URLSearchParams();

      // Add search query if provided
      if (searchQuery) {
        params.set("q", searchQuery);
      }

      // Add all filters
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });

      return `/api/products?${params.toString()}`;
    },
    []
  );

  // Search function
  const search = useCallback(
    async (searchQuery: string, searchFilters?: Partial<SearchParams>) => {
      setLoading(true);
      setError(null);

      try {
        const currentFilters = searchFilters || filters;
        const url = buildUrl(searchQuery, { ...currentFilters, page: 1 });

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setProducts(data.data.results || []);
        setTotalCount(data.data.count || 0);
        setHasMore(!!data.data.next);
        setQueryState(searchQuery);
        setFiltersState({ ...currentFilters, page: 1 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setProducts([]);
        setTotalCount(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [filters, buildUrl]
  );

  // Load more products for pagination
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = (filters.page || 1) + 1;
      const url = buildUrl(query, { ...filters, page: nextPage });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const newProducts = data.data.results || [];

      setProducts((prev) => [...prev, ...newProducts]);
      setFiltersState((prev) => ({ ...prev, page: nextPage }));
      setHasMore(!!data.data.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, query, filters, buildUrl]);

  // Reset search state
  const reset = useCallback(() => {
    setProducts([]);
    setQueryState(initialQuery);
    setFiltersState({ page: 1, page_size: 20, ...initialFilters });
    setTotalCount(0);
    setHasMore(false);
    setError(null);
  }, [initialQuery, initialFilters]);

  // Update query without searching
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // Update filters without searching
  const setFilters = useCallback((newFilters: Partial<SearchParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      search(initialQuery, filters);
    }
  }, [autoFetch]); // Only run on mount

  return {
    products,
    loading,
    error,
    totalCount,
    hasMore,
    query,
    filters,
    search,
    loadMore,
    reset,
    setQuery,
    setFilters,
  };
}

export default useProducts;
