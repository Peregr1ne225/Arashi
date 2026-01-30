// Product-related types

export interface ProductVariant {
    id: number;
    size_id: number;
    size_name: string;
    size_slug: string;
    color_id: number;
    color_name: string;
    color_code: string;
    stock: number;
    is_active: boolean;
}

export interface ProductColor {
    id: number;
    color_id: number;
    color_name: string;
    color_code: string;
    image: string | null;
}

export interface RawProduct extends Record<string, unknown> {
    id?: number;
    name?: string;
    description?: string;
    price?: number | string;
    stock?: number;
    images?: Array<string | { id: number; image: string }>;
    discounted_price?: number | string;
    discount?: number | string;
    isNew?: boolean;
    isBestseller?: boolean;
    rating?: number | string;
    category_id?: number;
    category?: Category;
    review_count?: number;
    tags?: string[];
    colors?: ProductColor[];
    variants?: ProductVariant[];
    subcategory?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Forward declaration to avoid circular import
import type { Category } from "./category";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;

    category: Category;
    category_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    // UI-specific properties (not from backend)
    originalPrice?: number;
    discount?: number;
    isNew?: boolean;
    isBestseller?: boolean;
    rating?: number;
    reviewCount?: number;
    tags?: string[];
    subcategory?: string;
    images: string[]; // Array of image URLs
    product_images: { id: number; image: string }[]; // Array of image objects with IDs
    variants: ProductVariant[];
    colors: ProductColor[];
}

export interface ProductListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}

/**
 * Minimal product data for card display - optimized for RSC boundaries
 * Use this type when passing products across server/client boundaries
 * to minimize serialization overhead (~12 fields vs 25+ in full Product)
 */
export interface ProductCardData {
    id: number;
    name: string;
    price: number;
    stock: number;
    images: string[];
    originalPrice?: number;
    discount?: number;
    isNew?: boolean;
    isBestseller?: boolean;
    rating?: number;
    reviewCount?: number;
    variants: ProductVariant[];
    colors: ProductColor[];
    categoryName?: string;
}

/**
 * Convert full Product to minimal ProductCardData for RSC boundary crossing
 */
export function toProductCardData(product: Product): ProductCardData {
    return {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        images: product.images,
        originalPrice: product.originalPrice,
        discount: product.discount,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
        rating: product.rating,
        reviewCount: product.reviewCount,
        variants: product.variants,
        colors: product.colors,
        categoryName: product.category?.name,
    };
}

export interface SearchParams {
    q?: string;
    category?: number;
    category_slug?: string;
    min_price?: number;
    max_price?: number;
    ordering?: string;
    active_only?: boolean;
    is_new?: boolean;
    is_sale?: boolean;
    page?: number;
    page_size?: number;
}
