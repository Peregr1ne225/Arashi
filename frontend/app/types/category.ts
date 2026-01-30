import type { Product } from "./product";

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent: number | null;
    parent_name?: string;
    image?: string;
    children?: Category[];
    product_count?: number;
    created_at: string;
    updated_at: string;
}

export interface CategoryDetail extends Category {
    products: Product[];
}

export interface CategoryListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Category[];
}