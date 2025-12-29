/**
 * Normalizes an image URL to ensure it points to the correct backend location.
 * If the path starts with '/', it prepends the backend API base URL.
 * Otherwise, it returns the path as is (assuming it's already absolute or external).
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return "/placeholder-product.svg";

    // STAGE 1: Handle static assets (placeholder)
    // If it's a known static asset, return as is (relative to frontend root)
    if (path === "/placeholder-product.jpg" || path === "/placeholder.jpg" || path === "/placeholder-product.svg") {
        return path;
    }

    // STAGE 2: Handle absolute URLs
    if (path.startsWith("http://") || path.startsWith("https://")) {
        // Fix for Docker networking issue: client cannot resolve 'backend' hostname
        return path.replace("http://backend:8000", "http://localhost:8000");
    }

    // STAGE 3: Handle relative backend paths
    // If path starts with /, assume it's relative to the backend ROOT (not API root)
    if (path.startsWith("/")) {
        // If it's a media path, let Next.js proxy handle it (don't prepend backend URL)
        if (path.startsWith("/media/")) {
            return path;
        }

        let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Strip '/api/v1' or '/api' suffixes to get the root URL
        // e.g. 'http://localhost:8000/api/v1' -> 'http://localhost:8000'
        backendUrl = backendUrl.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");

        // Remove trailing slash if present to avoid double slashes
        if (backendUrl.endsWith("/")) {
            backendUrl = backendUrl.slice(0, -1);
        }

        return `${backendUrl}${path}`;
    }

    return path;
};
