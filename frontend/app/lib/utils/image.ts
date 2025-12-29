/**
 * Normalizes an image URL to ensure it points to the correct backend location.
 *
 * This utility function handles different URL formats:
 * 1. Static assets (placeholders) - returned as-is
 * 2. Absolute URLs (http/https) - returned with Docker hostname fixes
 * 3. Relative backend paths (/media/*) - handled by Next.js proxy
 * 4. Relative API paths (/api/*) - prepended with backend base URL
 *
 * @param path - The image URL path to normalize. Can be null, undefined, or a string.
 * @returns Normalized image URL as a string.
 */
export const getImageUrl = (path: string | null | undefined): string => {
  // Guard clause: Handle null, undefined, or non-string values
  if (!path || typeof path !== "string") {
    return "/placeholder-product.svg";
  }

  // STAGE 1: Handle static assets (placeholders)
  // Known static assets should be returned relative to frontend root
  if (
    path === "/placeholder-product.jpg" ||
    path === "/placeholder.jpg" ||
    path === "/placeholder-product.svg"
  ) {
    return path;
  }

  // STAGE 2: Handle absolute URLs (http:// or https://)
  // For absolute URLs, only fix Docker hostname issues
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // Fix for Docker networking: client cannot resolve 'backend' hostname
    // Replace internal Docker hostname with localhost for development
    return path.replace("http://backend:8000", "http://localhost:8000");
  }

  // STAGE 3: Handle relative backend paths starting with '/'
  // If path starts with '/', it's a relative path to backend
  if (path.startsWith("/")) {
    // Media files should go through Next.js proxy (no backend URL needed)
    // This allows caching and proper handling in both dev and production
    if (path.startsWith("/media/")) {
      return path;
    }

    // API paths need the backend base URL prepended
    // Get backend URL from environment or use localhost as fallback
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Strip '/api/v1' or '/api' suffix to get the root URL
    // This prevents duplicate paths like: http://localhost:8000/api/v1/api/v1/products
    let normalizedBackendUrl = backendUrl
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/api\/?$/, "");

    // Remove trailing slash if present to avoid double slashes when concatenating
    if (normalizedBackendUrl.endsWith("/")) {
      normalizedBackendUrl = normalizedBackendUrl.slice(0, -1);
    }

    // Concatenate backend URL with the relative path
    return `${normalizedBackendUrl}${path}`;
  }

  // Fallback: Return path as-is for any other format
  return path;
};
