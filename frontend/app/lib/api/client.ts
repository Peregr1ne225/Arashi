import { Product, ProductListResponse, SearchParams, RawProduct } from "@/app/types/product";
import { Category } from "@/app/types/category";
import { Color, Size, Tag } from "@/app/types/attributes";
import { User } from "@/app/types/user";
import { Avatar, AvatarAsset } from "@/app/types/visualization";
import { api } from "../api";


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

// Helper function to fetch category by slug or path
async function getCategoryBySlug(slug: string): Promise<Category> {
  // If slug contains slashes (hierarchical path), we rely on the backend's catch-all regex
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
    params: SearchParams = {},
    config: { revalidate?: number } = {},
  ): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return cachedApiFetch<Category[]>(
      `/categories/?${searchParams.toString()}`,
      {
        revalidate: config.revalidate ?? 3600,
        tags: ["categories"],
      },
    ).then((results) => {
      // Add fallback slug and process children
      // The backend now returns a flat array since pagination is disabled
      if (!Array.isArray(results)) {
        return [];
      }

      return results.map((category: Category) => ({
        ...category,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
        children: (category.children || []).map((child: Category) => ({
          ...child,
          slug: child.slug || child.name.toLowerCase().replace(/\s+/g, "-"),
        })),
      }));
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
    return this.getCategories().then((res) =>
      res.filter((category: Category) => category.parent === null),
    );
  },

  /**
   * Create a new category
   */
  async createCategory(
    data: FormData | Record<string, unknown>,
  ): Promise<Category> {
    const response = await api.post("/categories/", data);
    if (!response.ok) {
      throw new Error("Failed to create category");
    }
    return response.json();
  },

  /**
   * Update a category
   */
  async updateCategory(
    id: number,
    data: FormData | Record<string, unknown>,
  ): Promise<Category> {
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
 * Helper to map API product (backend) to UI product
 */
function fixImageUrl(url: string): string {
  if (!url) return "";

  // Convert any absolute URL with /media/ to a relative path
  if (url.includes("/media/")) {
    return url.substring(url.indexOf("/media/"));
  }

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

export function mapProducts(products: RawProduct[]): Product[] {
  return products.map((product) => {
    // Collect all image URLs from the backend structure
    // product.images is an array of objects: [{id, image, display_order}, ...] or strings
    let imageUrls: string[] = [];

    if (Array.isArray(product.images)) {
      imageUrls = product.images.map((img: unknown) =>
        typeof img === "object" && img !== null && "image" in img
          ? (img as { image: string }).image
          : (img as string),
      );
    }

    // Sanitize URLs
    imageUrls = imageUrls
      .filter((url) => typeof url === "string" && url.length > 0)
      .map((url) => fixImageUrl(url));

    // Calculate pricing logic
    const rawPrice = Number(product.price);
    // TRUST BACKEND: Use the explicitly provided discounted_price if available.
    const discountedPrice = product.discounted_price
      ? Number(product.discounted_price)
      : rawPrice;

    // Determine if it's effectively discounted based on price difference
    const hasDiscount = discountedPrice < rawPrice;

    return {
      ...(product as unknown as Product), // Cast via unknown to baseline remaining fields
      // Ensure key properties are correctly typed and present
      id: product.id || 0,
      name: product.name || "",
      description: product.description || "",
      stock: product.stock || 0,
      is_active: product.is_active ?? true,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString(),
      price: hasDiscount ? discountedPrice : rawPrice,
      originalPrice: hasDiscount ? rawPrice : undefined,
      discount: product.discount ? Number(product.discount) : undefined,

      images: imageUrls,
      product_images: Array.isArray(product.images)
        ? product.images
          .map((img: unknown) => {
            const imgObj =
              typeof img === "object" && img !== null
                ? (img as { id: number; image: string })
                : { id: 0, image: String(img) };
            return {
              id: imgObj.id || 0,
              image: fixImageUrl(imgObj.image),
            };
          })
          .filter((img) => img.image)
        : [],

      // Add default UI properties if they don't exist
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      rating: Number(product.rating) || 0,
      category: product.category as Category,
      category_id: product.category_id || product.category?.id || 0,
      reviewCount:
        ((product as Record<string, unknown>).review_count as number) || 0,
      tags: product.tags || [],
      colors: product.colors || [],
      variants: product.variants || [],
      subcategory: product.subcategory || "",
    };
  });
}

export const productsApi = {
  /**
   * Create a new product
   */
  async createProduct(
    data: FormData | Record<string, unknown>,
  ): Promise<Product> {
    const response = await api.post("/products/", data);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }
      // Handle validation errors (dict of lists)
      const messages = Object.values(errorData).flat();
      if (messages.length > 0) {
        throw new Error(messages.join(", ") as string);
      }
      throw new Error("Failed to create product");
    }
    return response.json().then((product) => mapProducts([product])[0]);
  },

  /**
   * Update a product
   */
  async updateProduct(
    id: number,
    data: FormData | Record<string, unknown>,
  ): Promise<Product> {
    const response = await api.patch(`/products/${id}/`, data);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }
      // Handle validation errors
      const messages = Object.values(errorData).flat();
      if (messages.length > 0) {
        throw new Error(messages.join(", ") as string);
      }
      throw new Error("Failed to update product");
    }
    return response.json().then((product) => mapProducts([product])[0]);
  },

  /**
   * Update a product variant (stock or is_active)
   */
  async updateVariant(
    productId: number,
    colorId: number,
    sizeId: number,
    data: { stock?: number; is_active?: boolean },
  ): Promise<unknown> {
    const response = await api.post(`/products/${productId}/add_variant/`, {
      color_id: colorId,
      size_id: sizeId,
      ...data,
    });
    if (!response.ok) {
      throw new Error("Failed to update variant");
    }
    return response.json();
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await api.delete(`/products/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  },

  /**
   * Delete a product variant
   */
  async deleteVariant(
    productId: number,
    colorId: number,
    sizeId: number,
  ): Promise<void> {
    const response = await api.post(`/products/${productId}/remove_variant/`, {
      color_id: colorId,
      size_id: sizeId,
    });
    if (!response.ok) {
      throw new Error("Failed to delete variant");
    }
  },

  /**
   * Update a product color image
   */
  async updateColorImage(
    productId: number,
    colorId: number,
    image: File,
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append("color_id", String(colorId));
    formData.append("image", image);

    const response = await api.post(
      `/products/${productId}/update_color_image/`,
      formData,
    );
    if (!response.ok) {
      throw new Error("Failed to update color image");
    }
    return response.json();
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
    }

    const excludeFromLoop = ["category_slug", "category"];
    Object.entries(params).forEach(([key, value]) => {
      if (
        !excludeFromLoop.includes(key) &&
        value !== undefined &&
        value !== null
      ) {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/products/?${searchParams.toString()}`;

    return cachedApiFetch<
      Record<string, unknown> | { results: Record<string, unknown>[] }
    >(endpoint, {
      revalidate: config.revalidate ?? 1800, // Default 30 minutes
      tags: ["products"],
    }).then((response: unknown) => {
      const resp = response as { results?: Record<string, unknown>[] };
      // Ensure results exist
      if (!resp.results) {
        // If response is an array, it might be a flat list
        if (Array.isArray(response)) {
          return {
            count: response.length as number,
            next: null,
            previous: null,
            results: mapProducts(response as Record<string, unknown>[]),
          };
        }
        resp.results = [];
      }

      // Add UI-specific properties to products
      const results = mapProducts(resp.results as Record<string, unknown>[]);
      return {
        ...resp,
        results,
      } as unknown as ProductListResponse;
    });
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    const endpoint = `/products/featured/?limit=${limit}`;

    return cachedApiFetch<Record<string, unknown>[]>(endpoint, {
      revalidate: 3600, // 1 hour
      tags: ["products", "featured"],
    }).then((products) => mapProducts(products as Record<string, unknown>[]));
  },

  /**
   * Get a single product by ID
   */
  async getProduct(
    id: number,
    config: { revalidate?: number } = {},
  ): Promise<Product> {
    return cachedApiFetch<Record<string, unknown>>(`/products/${id}/`, {
      revalidate: config.revalidate ?? 3600, // Default 1 hour
      tags: ["product", String(id), "v2"],
    }).then((product) => {
      // Use shared mapper (wrapping single product in array and taking first result)
      return mapProducts([product] as Record<string, unknown>[])[0];
    });
  },

  /**
   * Search products by query
   */
  async searchProducts(query: string): Promise<Product[]> {
    return cachedApiFetch<Record<string, unknown>[]>(
      `/products/search/?q=${encodeURIComponent(query)}`,
      {
        revalidate: 1800, // 30 minutes
        tags: ["products", "search"],
      },
    ).then((products) => mapProducts(products as Record<string, unknown>[]));
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
    total_count: number;
    total_stock: number;
    total_value: number;
    avg_price: number;
    active_count: number;
    low_stock_count: number;
  }> {
    const searchParams = new URLSearchParams();

    // Special handling for category_slug parameter matching getProducts behavior
    if (params.category_slug) {
      try {
        const category = await getCategoryBySlug(params.category_slug);
        searchParams.append("category", String(category.id));
      } catch (error) {
        console.error(
          `Failed to find category with slug ${params.category_slug}:`,
          error,
        );
        return {
          min_price: 0,
          max_price: 1000,
          category_ids: [],
          total_count: 0,
          total_stock: 0,
          total_value: 0,
          avg_price: 0,
          active_count: 0,
          low_stock_count: 0,
        };
      }
    }
    // Handle numeric category ID directly
    else if (params.category) {
      searchParams.append("category", String(params.category));
    }

    const exclude = [
      "category_slug",
      "category",
      "page",
      "page_size",
      "ordering",
    ];
    Object.entries(params).forEach(([key, value]) => {
      if (!exclude.includes(key) && value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = `/products/stats/${queryString ? `?${queryString}` : ""}`;

    return cachedApiFetch<{
      min_price: number;
      max_price: number;
      category_ids: number[];
      total_count: number;
      total_stock: number;
      total_value: number;
      avg_price: number;
      active_count: number;
      low_stock_count: number;
    }>(url, {
      revalidate: 60, // Cache stats for 1 minute
      tags: ["products-stats"],
    });
  },

  async getLowStock(): Promise<
    Array<{
      id: number;
      name: string;
      stock: number;
      image: string | null;
    }>
  > {
    const response = await api.get("/products/low_stock/");
    if (!response.ok) {
      throw new Error("Failed to fetch low stock products");
    }
    return response.json();
  },
};

/**
 * Reviews API client
 */
export const reviewsApi = {
  async createReview(data: Record<string, unknown>): Promise<unknown> {
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
 * Attributes API client (Colors, Sizes, Tags)
 */
export const attributesApi = {
  // --- Colors ---
  async getColors(): Promise<Color[]> {
    const response = await api.get("/colors/");
    if (!response.ok) return [];
    return response.json();
  },

  async createColor(data: { name: string; code: string }): Promise<Color> {
    const response = await api.post("/colors/", data);
    if (!response.ok) throw new Error("Failed to create color");
    return response.json();
  },

  async updateColor(
    id: number,
    data: { name: string; code: string },
  ): Promise<Color> {
    const response = await api.patch(`/colors/${id}/`, data);
    if (!response.ok) throw new Error("Failed to update color");
    return response.json();
  },

  async deleteColor(id: number): Promise<void> {
    const response = await api.delete(`/colors/${id}/`);
    if (!response.ok) throw new Error("Failed to delete color");
  },

  // --- Sizes ---
  async getSizes(): Promise<Size[]> {
    const response = await api.get("/sizes/");
    if (!response.ok) return [];
    return response.json();
  },

  async createSize(data: { name: string; slug: string }): Promise<Size> {
    const response = await api.post("/sizes/", data);
    if (!response.ok) throw new Error("Failed to create size");
    return response.json();
  },

  async updateSize(
    id: number,
    data: { name: string; slug: string },
  ): Promise<Size> {
    const response = await api.patch(`/sizes/${id}/`, data);
    if (!response.ok) throw new Error("Failed to update size");
    return response.json();
  },

  async deleteSize(id: number): Promise<void> {
    const response = await api.delete(`/sizes/${id}/`);
    if (!response.ok) throw new Error("Failed to delete size");
  },

  // --- Tags ---
  async getTags(): Promise<Tag[]> {
    const response = await api.get("/tags/");
    if (!response.ok) return [];
    return response.json();
  },

  async createTag(data: { name: string; slug: string }): Promise<Tag> {
    const response = await api.post("/tags/", data);
    if (!response.ok) throw new Error("Failed to create tag");
    return response.json();
  },

  async updateTag(
    id: number,
    data: { name: string; slug: string },
  ): Promise<Tag> {
    const response = await api.patch(`/tags/${id}/`, data);
    if (!response.ok) throw new Error("Failed to update tag");
    return response.json();
  },

  async deleteTag(id: number): Promise<void> {
    const response = await api.delete(`/tags/${id}/`);
    if (!response.ok) throw new Error("Failed to delete tag");
  },
};

export interface HeroImage {
  id: number;
  title: string;
  image: string;
  is_active: boolean;
  order: number;
}

export interface SiteContent {
  key: string;
  content: Record<string, unknown>;
  updated_at: string;
}

/**
 * CMS API client
 */
export const cmsApi = {
  async getHeroImages(activeOnly = true): Promise<HeroImage[]> {
    // If public/activeOnly, we might not need auth, but api.get handles it naturally.
    // The backend ViewSet filters by is_active for non-staff anyway.
    const queryString = activeOnly ? "?is_active=true" : "";
    const response = await api.get(`/hero/${queryString}`);
    if (!response.ok) return [];
    const data = await response.json();

    // Process image URLs
    const images = (Array.isArray(data) ? data : data.results || []).map(
      (img: HeroImage) => ({
        ...img,
        image: fixImageUrl(img.image),
      }),
    );

    return images;
  },

  async uploadHeroImage(formData: FormData): Promise<HeroImage> {
    const response = await api.post("/hero/", formData);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || "Failed to upload hero image";
      throw new Error(message);
    }
    const img = await response.json();
    return { ...img, image: fixImageUrl(img.image) };
  },

  async deleteHeroImage(id: number): Promise<void> {
    const response = await api.delete(`/hero/${id}/`);
    if (!response.ok) throw new Error("Failed to delete hero image");
  },

  async getSiteContent(key: string): Promise<SiteContent | null> {
    const response = await api.get(`/site-content/${key}/`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch site content");
    return response.json();
  },

  async updateSiteContent(
    key: string,
    content: Record<string, unknown>,
  ): Promise<SiteContent> {
    // Try to update first, if 404 then create (though ViewSet handles create usually,
    // but lookup by key in update might fail if not exists?
    // Actually, ViewSet update expects ID usually unless lookup_field is set.
    // We set lookup_field to 'key'. So UPDATE should work if it exists.
    // To 'create' passing the key in the URL might be tricky for standard ModelViewSet if it's strictly REST.
    // Let's rely on standard: POST to /site-content/ to create, PATCH to /site-content/{key}/ to update.

    // First try GET to see if it exists
    const existing = await this.getSiteContent(key);
    if (existing) {
      const response = await api.patch(`/site-content/${key}/`, { content });
      if (!response.ok) throw new Error("Failed to update site content");
      return response.json();
    } else {
      const response = await api.post("/site-content/", { key, content });
      if (!response.ok) throw new Error("Failed to create site content");
      return response.json();
    }
  },

  async updateHeroImage(
    id: number,
    data: Partial<HeroImage>,
  ): Promise<HeroImage> {
    // For simple updates like order/is_active
    const response = await api.patch(`/hero/${id}/`, data);
    if (!response.ok) throw new Error("Failed to update hero image");
    const img = await response.json();
    return { ...img, image: fixImageUrl(img.image) };
  },
};

/**
 * Users API client for admin management
 */
export const usersApi = {
  async getUsers(
    params: {
      search?: string;
      is_staff?: boolean;
      is_active?: boolean;
      page?: number;
      page_size?: number;
      ordering?: string;
    } = {},
  ): Promise<{ count: number; next: string | null; previous: string | null; results: User[] }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const response = await api.get(
      `/auth/users/${queryString ? `?${queryString}` : ""}`,
    );
    if (!response.ok) throw new Error("Failed to fetch users");
    const data = await response.json();

    // Normalize response to always be paginated structure
    if (Array.isArray(data)) {
      return {
        count: data.length,
        next: null,
        previous: null,
        results: data
      };
    }
    return data;
  },

  async getStats(): Promise<{
    total_users: number;
    active_users: number;
    admin_users: number;
    superuser_users: number;
  }> {
    const response = await api.get("/auth/users/stats/");
    if (!response.ok) throw new Error("Failed to fetch user stats");
    return response.json();
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await api.patch(`/auth/users/${id}/`, data);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update user");
    }
    return response.json();
  },

  async toggleUserStatus(id: number, is_active: boolean): Promise<User> {
    return this.updateUser(id, { is_active });
  },

  async makeAdmin(id: number): Promise<User> {
    return this.updateUser(id, { is_staff: true });
  },

  async removeAdmin(id: number): Promise<User> {
    return this.updateUser(id, { is_staff: false });
  },

  async makeSuperuser(id: number): Promise<User> {
    return this.updateUser(id, { is_superuser: true });
  },

  async removeSuperuser(id: number): Promise<User> {
    return this.updateUser(id, { is_superuser: false });
  },

  async deleteUser(id: number): Promise<void> {
    const response = await api.delete(`/auth/users/${id}/`);
    if (!response.ok) throw new Error("Failed to delete user");
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get(`/auth/users/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },
};

/**
 * Utility function to revalidate cache for specific tags
 */
export async function revalidateCache(tags: string[]): Promise<void> {
  try {
    // In a real deployment, we use Server Actions to invalidate cache
    if (tags.length > 0) {
      // Dynamically import to avoid server-only module issues in some contexts if needed,
      // but typically direct import works in Next.js Client Components.
      // We assume actions.ts is "use server" and safe to import.
      const { revalidateCacheTags } = await import("@/app/lib/actions");
      await revalidateCacheTags(tags);
      console.log(`Revalidated cache for tags: ${tags.join(", ")}`);
    }
  } catch (error) {
    console.error("Failed to revalidate cache:", error);
  }
}

/**
 * Visualization API client (Avatars)
 */
export const visualizationApi = {
  async getAvatars(): Promise<Avatar[]> {
    const response = await api.get("/avatars/");
    if (!response.ok) return [];

    const data = await response.json();
    // Map URL fix
    const avatars = (Array.isArray(data) ? data : data.results || []).map((avatar: Avatar) => ({
      ...avatar,
      base_file: fixImageUrl(avatar.base_file),
      thumbnail: avatar.thumbnail ? fixImageUrl(avatar.thumbnail) : null,
      assets: avatar.assets.map((asset) => ({
        ...asset,
        file: fixImageUrl(asset.file),
        thumbnail: asset.thumbnail ? fixImageUrl(asset.thumbnail) : null,
      })),
    }));

    return avatars;
  },

  async getAvatar(slug: string): Promise<Avatar> {
    const response = await api.get(`/avatars/${slug}/`);
    if (!response.ok) throw new Error("Avatar not found");
    const avatar = await response.json();

    return {
      ...avatar,
      base_file: fixImageUrl(avatar.base_file),
      thumbnail: avatar.thumbnail ? fixImageUrl(avatar.thumbnail) : null,
      assets: avatar.assets.map((asset: AvatarAsset) => ({
        ...asset,
        file: fixImageUrl(asset.file),
        thumbnail: asset.thumbnail ? fixImageUrl(asset.thumbnail) : null,
      })),
    };
  },

  async createAvatar(data: FormData): Promise<Avatar> {
    const response = await api.post("/avatars/", data);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to create avatar");
    }
    return response.json();
  },

  async deleteAvatar(slug: string): Promise<void> {
    const response = await api.delete(`/avatars/${slug}/`);
    if (!response.ok) throw new Error("Failed to delete avatar");
  },

  async createAvatarAsset(data: FormData): Promise<AvatarAsset> {
    const response = await api.post("/avatar-assets/", data);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to create asset");
    }
    return response.json();
  },

  async deleteAvatarAsset(id: number): Promise<void> {
    const response = await api.delete(`/avatar-assets/${id}/`);
    if (!response.ok) throw new Error("Failed to delete asset");
  }
};
