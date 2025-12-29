// Cache utilities for Next.js App Router
// Provides helper functions for cache management

import { revalidateTag, revalidatePath } from 'next/cache';

// Cache tags for different types of data
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  PRODUCT: (id: string | number) => `product-${id}`,
  CATEGORIES: 'categories',
  CATEGORY: (id: string | number) => `category-${id}`,
  SEARCH: 'search',
} as const;

// Revalidation functions
export const revalidateProducts = () => revalidateTag(CACHE_TAGS.PRODUCTS, "max");
export const revalidateProduct = (id: string | number) => revalidateTag(CACHE_TAGS.PRODUCT(id), "max");
export const revalidateCategories = () => revalidateTag(CACHE_TAGS.CATEGORIES, "max");
export const revalidateCategory = (id: string | number) => revalidateTag(CACHE_TAGS.CATEGORY(id), "max");
export const revalidateSearch = () => revalidateTag(CACHE_TAGS.SEARCH, "max");

// Path revalidation functions
export const revalidateHomePage = () => revalidatePath('/');
export const revalidateProductPage = (id: string | number) => revalidatePath(`/product/${id}`);
export const revalidateCategoryPage = (id: string | number) => revalidatePath(`/category/${id}`);
export const revalidateSearchPage = () => revalidatePath('/search');

// Batch revalidation function
export const revalidateAllProductRelated = () => {
  revalidateProducts();
  revalidateCategories();
  revalidateSearch();
  revalidateHomePage();
};

// Revalidate after mutations
export const revalidateAfterProductUpdate = (id: string | number) => {
  revalidateProduct(id);
  revalidateProducts();
  revalidateHomePage();
};

export const revalidateAfterCategoryUpdate = (id: string | number) => {
  revalidateCategory(id);
  revalidateCategories();
  revalidateHomePage();
};
