import { useState, useEffect, useCallback } from "react";
import { Category } from "@/app/types";

interface UseCategoriesOptions {
  autoFetch?: boolean;
}

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCategories({
  autoFetch = true,
}: UseCategoriesOptions = {}): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  return {
    categories,
    loading,
    error,
    refresh,
  };
}

export default useCategories;
