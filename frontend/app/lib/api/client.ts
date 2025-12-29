import {
  Product,
  Category,
  ProductListResponse,
  CategoryListResponse,
  SearchParams,
} from "@/app/types";
import { api } from "../api/index";

/**
 * API client with Next.js caching options
 */
async function cachedApiFetch<T>(
  endpoint: string,
  options: {
    revalidate?: number;
    tags?: string[];
  } = {},
): Promise<T> {
  const { revalidate = 3600, tags = [] } = options;

  let finalEndpoint = endpoint;
  if (revalidate === 0) {
    const separator = finalEndpoint.includes("?") ? "&" : "?";
    finalEndpoint = `${finalEndpoint}${separator}_t=${Date.now()}`;
  }

  // Use shared api client which handles Auth headers and Token Refresh consistently
  const response = await api.get(finalEndpoint, {
    cache: revalidate === 0 ? "no-store" : undefined,
    headers: {
      // Headers are merged in api.get
    },
    next: {
      revalidate,
      tags,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data && data.data && !data.results) {
    return data.data as T;
  }
  return data as T;
}

// Helper function to fetch category by slug
async function getCategoryBySlug(slug: string): Promise<Category> {
  return cachedApiFetch<Category>(`/categories/by-slug/${slug}/`, {
    revalidate: 3600, // 1 hour
    tags: ["category", slug],
  });
}

/**
 * Categories API client
 */
export const categoriesApi = {
  /**
   * Get all categories
   */
  async getCategories(
    config: { revalidate?: number } = {},
  ): Promise<Category[]> {
    return cachedApiFetch<CategoryListResponse>("/categories/", {
      revalidate: config.revalidate ?? 3600, // Default 1 hour
      tags: ["categories"],
    }).then((res: any) => {
      const categories = Array.isArray(res) ? res : res.results || [];

      // Add fallback slug for categories that don't have one
      const processedCategories = categories.map((category: Category) => ({
        ...category,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
        // Process children recursively
        children: (category.children || []).map((child: Category) => ({
          ...child,
          slug: child.slug || child.name.toLowerCase().replace(/\s+/g, "-"),
        })),
      }));
      return processedCategories;
    });
  },

  /**
   * Get a single category by ID
   */
  async getCategory(id: number): Promise<Category> {
    return cachedApiFetch<Category>(`/categories/${id}/`, {
      revalidate: 3600, // 1 hour
      tags: ["category", String(id)],
    });
  },

  /**
   * Get a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await cachedApiFetch<Category>(
      `/categories/by-slug/${slug}/`,
      {
        revalidate: 3600, // 1 hour
        tags: ["category", slug],
      },
    );
    return category;
  },

  /**
   * Get top-level categories (no parent)
   */
  async getTopLevelCategories(): Promise<Category[]> {
    // This would need to be implemented on the backend as a filter
    // For now, we'll fetch all and filter on the client
    return this.getCategories().then((categories) =>
      categories.filter((category) => category.parent === null),
    );
  },

  /**
   * Create a new category
   */
  async createCategory(data: FormData | any): Promise<Category> {
    const response = await api.post("/categories/", data);
    if (!response.ok) {
      throw new Error("Failed to create category");
    }
    return response.json();
  },

  /**
   * Update a category
   */
  async updateCategory(id: number, data: FormData | any): Promise<Category> {
    const response = await api.patch(`/categories/${id}/`, data);
    if (!response.ok) {
      throw new Error("Failed to update category");
    }
    return response.json();
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<void> {
    const response = await api.delete(`/categories/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to delete category");
    }
  },
};

/**
 * Products API client
 */

/**
 * Products API client
 */
/**
 * Helper to map API product (backend) to UI product
 */
function fixImageUrl(url: string): string {
  if (!url) return "";
  // valid for docker internal network
  if (url.includes("backend:8000")) {
    return url.replace("http://backend:8000", "");
  }
  // valid for local dev without docker networking
  if (url.includes("127.0.0.1:8000")) {
    return url.replace("http://127.0.0.1:8000", "");
  }
  return url;
}

export function mapProducts(products: any[]): Product[] {
  return products.map((product) => {
    // Collect all potential image sources from the new backend structure
    let imageUrls: string[] = [];

    // product.images is now an array of objects: [{id, image, display_order}, ...]
    if (Array.isArray(product.images)) {
      imageUrls = product.images.map((img: any) =>
        typeof img === "object" && img.image ? img.image : img,
      );
    }

    // Sanitize URLs
    imageUrls = imageUrls
      .filter((url) => typeof url === "string" && url.length > 0)
      .map((url) => fixImageUrl(url));

    // Determine main image
    let mainImage = "";
    if (product.main_image) {
      mainImage = fixImageUrl(product.main_image);
    } else if (imageUrls.length > 0) {
      mainImage = imageUrls[0];
    }

    // Calculate pricing logic
    const rawPrice = Number(product.price);
    // TRUST BACKEND: Use the explicitly provided discounted_price if available.
    let discountedPrice = product.discounted_price
      ? Number(product.discounted_price)
      : rawPrice;

    // Determine if it's effectively discounted based on price difference
    const hasDiscount = discountedPrice < rawPrice;

    return {
      ...product,
      // Map to UI properties
      price: hasDiscount ? discountedPrice : rawPrice,
      originalPrice: hasDiscount ? rawPrice : undefined,
      discount: product.discount ? Number(product.discount) : undefined,

      image: mainImage,
      // Deprecated field
      image_url: mainImage,
      images: imageUrls,
      images_data: Array.isArray(product.images) ? product.images : [],

      // Add default UI properties if they don't exist
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      rating: Number(product.rating) || 0,
      reviewCount: (product as any).review_count || 0,
      tags: product.tags || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      subcategory: product.subcategory || "",
    };
  });
}

export const productsApi = {
  /**
   * Create a new product
   */
  async createProduct(data: FormData | any): Promise<Product> {
    const response = await api.post("/products/", data);
    if (!response.ok) {
      // Parse error response for detailed information
      let errorData;
      let rawText = "";

      try {
        // Try to parse as JSON first
        errorData = await response.json();
      } catch (e) {
        // If JSON fails, get raw text
        try {
          rawText = await response.text();
          console.error("Non-JSON error response:", rawText);
          errorData = {
            detail: `Server error (400): ${rawText.substring(0, 200)}${rawText.length > 200 ? "..." : ""}`,
          };
        } catch (textError) {
          errorData = { detail: "Failed to parse error response" };
        }
      }

      // Create enhanced error with response details
      const error: any = new Error(
        errorData.detail || errorData.message || "Failed to create product",
      );
      error.response = response;
      error.data = errorData;
      error.status = response.status;
      error.rawText = rawText;
      throw error;
    }
    return response.json().then((product) => mapProducts([product])[0]);
  },

  /**
   * Update a product
   */
  async updateProduct(id: number, data: FormData | any): Promise<Product> {
    const response = await api.patch(`/products/${id}/`, data);
    if (!response.ok) {
      throw new Error("Failed to update product");
    }
    return response.json().then((product) => mapProducts([product])[0]);
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    const response = await api.delete(`/products/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  },
  /**
   * Get a list of products with optional filtering
   */
  async getProducts(
    params: SearchParams = {},
    config: { revalidate?: number } = {},
  ): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();

    // Special handling for category_slug parameter
    if (params.category_slug) {
      // First get the category by slug to get its ID
      try {
        const category = await getCategoryBySlug(params.category_slug);
        searchParams.append("category", String(category.id));
        // Remove category_slug from params to avoid adding it as a query param
        const { category_slug, ...restParams } = params;
        params = restParams;
      } catch (error) {
        console.error(
          `Failed to find category with slug ${params.category_slug}:`,
          error,
        );
        // If category not found, return empty results
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
    }
    // Handle numeric category ID directly
    else if (params.category) {
      // Ensure category is a string for URLSearchParams
      searchParams.append("category", String(params.category));
      // Remove category from params to avoid duplicate
      const { category, ...restParams } = params;
      params = restParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/products/?${searchParams.toString()}`;

    return cachedApiFetch<ProductListResponse>(endpoint, {
      revalidate: config.revalidate ?? 1800, // Default 30 minutes
      tags: ["products"],
    }).then((response) => {
      // Ensure results exist
      if (!response.results) {
        // If response is an array, it might be a flat list
        if (Array.isArray(response)) {
          return {
            count: response.length,
            next: null,
            previous: null,
            results: mapProducts(response),
          };
        }
        response.results = [];
      }

      // Add UI-specific properties to products
      response.results = mapProducts(response.results);
      return response;
    });
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    const endpoint = `/products/featured/?limit=${limit}`;

    return cachedApiFetch<Product[]>(endpoint, {
      revalidate: 3600, // 1 hour
      tags: ["products", "featured"],
    }).then((products) => mapProducts(products));
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    return cachedApiFetch<Product>(`/products/${id}/`, {
      revalidate: 1800, // 30 minutes
      tags: ["product", String(id)],
    }).then((product) => {
      // Use shared mapper (wrapping single product in array and taking first result)
      return mapProducts([product])[0];
    });
  },

  /**
   * Search products by query
   */
  async searchProducts(query: string): Promise<Product[]> {
    return cachedApiFetch<Product[]>(
      `/products/search/?q=${encodeURIComponent(query)}`,
      {
        revalidate: 1800, // 30 minutes
        tags: ["products", "search"],
      },
    ).then((products) => mapProducts(products));
  },

  /**
   * Get new arrivals (most recently created products)
   */
  async getNewArrivals(limit = 10): Promise<Product[]> {
    return this.getProducts({
      is_new: true,
      ordering: "-created_at",
      page_size: limit,
    }).then((res) => {
      // Mark these as new arrivals for UI display if needed
      return res.results.map((product) => ({
        ...product,
        isNew: true,
      }));
    });
  },

  /**
   * Get bestsellers (this would need to be implemented on the backend)
   * For now, we'll use a simple filter with ordering
   */
  async getBestsellers(limit = 10): Promise<Product[]> {
    // This is a placeholder - in a real app, you'd have a dedicated endpoint
    // or a field like 'is_bestseller' in the Product model
    return this.getProducts({
      ordering: "-sold_count",
      page_size: limit,
    }).then((res) => {
      // Mark these as bestsellers for UI display
      return res.results.map((product) => ({
        ...product,
        isBestseller: true,
      }));
    });
  },

  /**
   * Get products on sale
   */
  async getSaleProducts(limit = 10): Promise<Product[]> {
    return this.getProducts({
      is_sale: true,
      ordering: "-created_at",
      page_size: limit,
    }).then((res) => res.results);
  },

  async getProductsByCategory(
    categoryId: number,
    limit = 10,
  ): Promise<Product[]> {
    return this.getProducts({
      category: categoryId,
      page_size: limit,
    }).then((res) => res.results);
  },

  /**
   * Get product statistics (min/max price) for current filters
   */
  async getProductStats(params: SearchParams = {}): Promise<{
    min_price: number;
    max_price: number;
    category_ids?: number[];
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return cachedApiFetch<{
      min_price: number;
      max_price: number;
      category_ids?: number[];
    }>(`/products/stats/?${searchParams.toString()}`, {
      revalidate: 60, // Cache stats for 1 minute
      tags: ["products-stats"],
    });
  },

  /**
   * Health check - verify backend connection
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await api.get("/health/");
    if (!response.ok) {
      throw new Error("Backend health check failed");
    }
    return response.json();
  },
};

/**
 * Reviews API client
 */
export const reviewsApi = {
  async createReview(data: any): Promise<any> {
    const response = await api.post("/reviews/", data);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // If errorData has a 'detail' field, use it. Otherwise, look for field errors.
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }
      // If it's a list of errors (validation errors), join them
      const messages = Object.values(errorData).flat();
      if (messages.length > 0) {
        throw new Error(messages.join(", ") as string);
      }
      throw new Error("Failed to submit review");
    }
    return response.json();
  },
};

/**
 * Utility function to revalidate cache for specific tags
 */
export async function revalidateCache(tags: string[]): Promise<void> {
  try {
    // In a real deployment, you would call the revalidation endpoint
    // This is a placeholder function for demonstration
    console.log(`Revalidating cache for tags: ${tags.join(", ")}`);

    // Example of how you might call a revalidation endpoint in a production environment:
    // await fetch('/api/revalidate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ tags }),
    // });
  } catch (error) {
    console.error("Failed to revalidate cache:", error);
  }
}
