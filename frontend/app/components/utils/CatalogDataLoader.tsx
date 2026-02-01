import { categoriesApi } from "@/app/lib/api/client";
import { ProductListResponse, Product } from "@/app/types/product";
import { Category } from "@/app/types/category";
import { ReactNode } from "react";

interface CatalogDataLoaderProps {
    productPromise: Promise<ProductListResponse>;
    children: (data: {
        products: Product[];
        categories: Category[];
        count: number;
        // We can pass the full response too if needed, but these are the main ones
        fullResponse?: ProductListResponse;
    }) => ReactNode;
}

export default async function CatalogDataLoader({
    productPromise,
    children,
}: CatalogDataLoaderProps) {
    let productsResponse: ProductListResponse = { results: [], count: 0, next: null, previous: null };
    let categories: Category[] = [];

    try {
        const [prodData, catData] = await Promise.all([
            productPromise,
            categoriesApi.getCategories(),
        ]);
        productsResponse = prodData;
        categories = catData;
    } catch (error) {
        console.warn("Failed to fetch catalog data:", error);
    }

    return children({
        products: productsResponse.results || [],
        categories,
        count: productsResponse.count || 0,
        fullResponse: productsResponse
    });
}
