import { BlogPost, BlogPostDetail, BlogPostListResponse, BlogComment } from "@/app/types";
import Cookies from "js-cookie";

// Base API URL - adjust this to match your backend configuration
const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
    ? process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api/v1"
    : "/api";

// Common headers for API requests
const headers = {
    "Content-Type": "application/json",
};

/**
 * Get auth headers for authenticated requests
 */
function getAuthHeaders(): Record<string, string> {
    const token = Cookies.get("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Generic API client with error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: { ...headers, ...getAuthHeaders() },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
    }
}

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

    return apiFetch<T>(endpoint, {
        next: {
            revalidate,
            tags,
        },
    });
}

/**
 * Interface for image generation parameters
 */
export interface GenerationParams {
    gender: string;
    skinTone: string;
    neckType: string;
    chestSize: string;
    hipSize: string;
    shoulderSize: string;
    armLength: string;
    faceShape: string;
    country?: string;
    title?: string;
    content?: string;
}

/**
 * Blogs API client
 */
export const blogsApi = {
    /**
     * Get all published blog posts
     */
    /**
     * Get all published blog posts with filtering/pagination
     */
    async getPosts(
        params: {
            page?: number;
            page_size?: number;
            search?: string;
            category?: string;
        } = {}
    ): Promise<BlogPostListResponse> {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append("page", String(params.page));
            if (params.page_size) queryParams.append("page_size", String(params.page_size));
            if (params.search) queryParams.append("search", params.search);
            if (params.category) queryParams.append("category", params.category);

            const response = await cachedApiFetch<BlogPostListResponse>(`/blogs/posts/?${queryParams.toString()}`, {
                revalidate: params.search ? 0 : 300, // No cache for search, 5 min for feed
                tags: ["blogs", "posts"],
            });
            // Ensure we match the interface (handle raw array vs paginated)
            if (Array.isArray(response)) {
                return {
                    count: response.length,
                    next: null,
                    previous: null,
                    results: response
                };
            }
            return response;
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            // Return empty structure on error
            return { count: 0, next: null, previous: null, results: [] };
        }
    },

    /**
     * Get a single blog post by ID
     */
    async getPost(id: number | string): Promise<BlogPostDetail> {
        return cachedApiFetch<BlogPostDetail>(`/blogs/posts/${id}/`, {
            revalidate: 300, // 5 minutes
            tags: ["blogs", "post", String(id)],
        });
    },

    /**
     * Create a new blog post (authenticated)
     */
    async createPost(data: { title: string; content: string; image?: File; temp_image_path?: string }): Promise<BlogPost> {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content);
        if (data.image) {
            formData.append("image", data.image);
        }
        if (data.temp_image_path) {
            formData.append("temp_image_path", data.temp_image_path);
        }

        const token = Cookies.get("accessToken");

        const response = await fetch(`${API_BASE_URL}/blogs/posts/`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to create post");
        }

        return response.json();
    },

    /**
     * Generate AI image for blog post
     */
    async generateImage(data: GenerationParams): Promise<{ image_url: string; temp_path: string }> {
        const token = Cookies.get("accessToken");

        const response = await fetch(`${API_BASE_URL}/blogs/generate-image/`, {
            method: "POST",
            headers: {
                ...headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to generate image");
        }

        return response.json();
    },

    /**
     * Delete a blog post (author or admin)
     */
    async deletePost(id: number | string): Promise<void> {
        const token = Cookies.get("accessToken");

        const response = await fetch(`${API_BASE_URL}/blogs/posts/${id}/`, {
            method: "DELETE",
            headers: {
                ...headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete post");
        }
    },

    /**
     * Get comments for a post
     */
    async getComments(postId: number | string): Promise<BlogComment[]> {
        try {
            const response = await apiFetch<BlogComment[] | { results: BlogComment[] }>(`/blogs/comments/?post=${postId}`);
            // Handle both array and paginated response
            if (Array.isArray(response)) {
                return response;
            }
            return response?.results || [];
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            return [];
        }
    },

    /**
     * Create a new comment (authenticated) with Image support
     */
    async createComment(postId: number | string, content: string, image?: File): Promise<BlogComment> {
        const token = Cookies.get("accessToken");

        // Use FormData for image upload
        const formData = new FormData();
        formData.append("post", String(postId));
        formData.append("content", content);
        if (image) {
            formData.append("image", image);
        }

        const response = await fetch(`${API_BASE_URL}/blogs/comments/`, {
            method: "POST",
            headers: {
                // Content-Type header not set manually for FormData, fetch sets boundary
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to create comment");
        }

        return response.json();
    },

    /**
     * Delete a comment (author or admin)
     */
    async deleteComment(commentId: number): Promise<void> {
        const token = Cookies.get("accessToken");

        const response = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}/`, {
            method: "DELETE",
            headers: {
                ...headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete comment");
        }
    },
};

/**
 * Get WebSocket URL for real-time comments
 */
export function getCommentsWebSocketUrl(postId: number | string): string {
    if (typeof window === "undefined") return "";

    // 1. If logic specific to NGrok is needed and we have a dedicated backend WS URL configured
    // 1. If logic specific to NGrok is needed and we have a dedicated backend WS URL configured
    const overrideUrl = process.env.NEXT_PUBLIC_WS_URL;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (overrideUrl) {
        // overrideUrl should be like "wss://backend-tunnel.ngrok-free.app"
        const protocol = overrideUrl.startsWith("http") ? overrideUrl.replace(/^http/, "ws") : overrideUrl;
        const normalizedBase = protocol.replace(/\/$/, "");
        const token = Cookies.get("accessToken");
        const wsUrl = `${normalizedBase}/ws/blogs/${postId}/comments/`;
        return token ? `${wsUrl}?token=${token}` : wsUrl;
    }

    // 2. Default logic using window host (Proxy or Localhost)
    // This assumes /ws/ requests are proxied by Next.js (as configured in next.config.ts)
    // to the backend, regardless of whether we are on localhost or ngrok.
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const token = Cookies.get("accessToken");

    // Special handling for localhost development to bypass proxy if needed
    if (host.includes("localhost")) {
        const localProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${localProtocol}//localhost:8000/ws/blogs/${postId}/comments/`;
        return token ? `${wsUrl}?token=${token}` : wsUrl;
    }

    const wsUrl = `${protocol}//${host}/ws/blogs/${postId}/comments/`;
    return token ? `${wsUrl}?token=${token}` : wsUrl;
}
