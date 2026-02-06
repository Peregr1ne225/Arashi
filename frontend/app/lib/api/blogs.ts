import {
    BlogPost,
    BlogPostDetail,
    BlogPostListResponse,
    BlogComment,
    BlogCommentListResponse,
} from "@/app/types/blog";
import Cookies from "js-cookie";

// Base API URL - adjust this to match your backend configuration
const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
    ? process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api/v1"
    : "/api/v1";

// Direct API URL for FormData uploads (bypasses Next.js proxy to avoid body forwarding issues)
const DIRECT_API_URL = isServer
    ? process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api/v1"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Common headers for API requests
const headers = {
    "Content-Type": "application/json",
};

/**
 * Get auth headers for authenticated requests
 */
function getAuthHeaders(method?: string): Record<string, string> {
    const token = Cookies.get("accessToken");
    const csrfToken = Cookies.get("csrftoken");
    const headers: Record<string, string> = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Add CSRF token for mutation requests
    if (
        csrfToken &&
        method &&
        !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method.toUpperCase())
    ) {
        headers["X-CSRFToken"] = csrfToken;
    }

    return headers;
}

/**
 * Generic API client with error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                ...headers,
                ...(skipAuth ? {} : getAuthHeaders(fetchOptions.method)),
            },
            ...fetchOptions,
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
        skipAuth?: boolean;
    } = {},
): Promise<T> {
    const { revalidate = 3600, tags = [], skipAuth = false } = options;

    return apiFetch<T>(endpoint, {
        skipAuth,
        next: {
            revalidate,
            tags,
        },
    });
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
            ordering?: string;
            author?: string;
        } = {},
    ): Promise<BlogPostListResponse> {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append("page", String(params.page));
            if (params.page_size)
                queryParams.append("page_size", String(params.page_size));
            if (params.search) queryParams.append("search", params.search);
            if (params.category) queryParams.append("category", params.category);
            if (params.ordering) queryParams.append("ordering", params.ordering);
            if (params.author) queryParams.append("author__username", params.author);

            const response = await cachedApiFetch<BlogPostListResponse>(
                `/blogs/posts/?${queryParams.toString()}`,
                {
                    revalidate: params.search ? 0 : 300, // No cache for search, 5 min for feed
                    tags: ["blogs", "posts"],
                    skipAuth: true,
                },
            );
            // Ensure we match the interface (handle raw array vs paginated)
            if (Array.isArray(response)) {
                return {
                    count: response.length,
                    next: null,
                    previous: null,
                    results: response,
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
            skipAuth: true,
        });
    },

    /**
     * Create a new blog post (authenticated)
     */
    async createPost(data: {
        title: string;
        content: string;
        image?: File;
        temp_image_path?: string;
    }): Promise<BlogPost> {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content);
        if (data.image) {
            formData.append("image", data.image);
        }
        if (data.temp_image_path) {
            formData.append("temp_image_path", data.temp_image_path);
        }

        // Use DIRECT_API_URL to bypass Next.js proxy for FormData body
        const response = await fetch(`${DIRECT_API_URL}/blogs/posts/`, {
            method: "POST",
            headers: {
                ...getAuthHeaders("POST"),
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
     * Delete a blog post (author or admin)
     */
    async deletePost(id: number | string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/blogs/posts/${id}/`, {
            method: "DELETE",
            headers: {
                ...headers,
                ...getAuthHeaders("DELETE"),
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete post");
        }
    },

    /**
     * Get comments for a post
     */
    async getComments(
        postId: number | string,
        page: number = 1,
        ordering?: string,
    ): Promise<BlogCommentListResponse> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("post", String(postId));
            queryParams.append("page", String(page));
            if (ordering) queryParams.append("ordering", ordering);

            const response = await apiFetch<BlogCommentListResponse>(
                `/blogs/comments/?${queryParams.toString()}`,
                { skipAuth: true }
            );
            // Handle both array and paginated response
            if (Array.isArray(response)) {
                return {
                    count: response.length,
                    next: null,
                    previous: null,
                    results: response,
                };
            }
            return response;
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            return { count: 0, next: null, previous: null, results: [] };
        }
    },

    /**
     * Create a new comment (authenticated) with Image support
     */
    async createComment(
        postId: number | string,
        content: string,
        image?: File,
    ): Promise<BlogComment> {
        // Use FormData for image upload
        const formData = new FormData();
        formData.append("post", String(postId));
        formData.append("content", content);
        if (image) {
            formData.append("image", image);
        }

        // Use DIRECT_API_URL to bypass Next.js proxy for FormData
        const response = await fetch(`${DIRECT_API_URL}/blogs/comments/`, {
            method: "POST",
            headers: {
                ...getAuthHeaders("POST"),
                // Content-Type header not set manually for FormData, fetch sets boundary
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
        const response = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}/`, {
            method: "DELETE",
            headers: {
                ...headers,
                ...getAuthHeaders("DELETE"),
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete comment");
        }
    },

    /**
     * Toggle like for a blog post
     */
    async likePost(id: number | string): Promise<{ has_liked: boolean; likes_count: number }> {
        const response = await fetch(`${API_BASE_URL}/blogs/posts/${id}/like/`, {
            method: "POST",
            headers: {
                ...headers,
                ...getAuthHeaders("POST"),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to like post");
        }

        return response.json();
    },

    /**
     * Toggle like for a comment
     */
    async likeComment(commentId: number | string): Promise<{ has_liked: boolean; likes_count: number }> {
        const response = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}/like/`, {
            method: "POST",
            headers: {
                ...headers,
                ...getAuthHeaders("POST"),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to like comment");
        }

        return response.json();
    },

};


/**
 * Get WebSocket URL for real-time comments
 */
export function getCommentsWebSocketUrl(postId: number | string): string {
    if (typeof window === "undefined") return "";

    // 1. If logic specific to NGrok is needed and we have a dedicated backend WS URL configured
    const overrideUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (overrideUrl) {
        // overrideUrl should be like "wss://backend-tunnel.ngrok-free.app"
        const protocol = overrideUrl.startsWith("http")
            ? overrideUrl.replace(/^http/, "ws")
            : overrideUrl;
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
        const localProtocol =
            window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${localProtocol}//localhost:8000/ws/blogs/${postId}/comments/`;
        return token ? `${wsUrl}?token=${token}` : wsUrl;
    }

    const wsUrl = `${protocol}//${host}/ws/blogs/${postId}/comments/`;
    return token ? `${wsUrl}?token=${token}` : wsUrl;
}
