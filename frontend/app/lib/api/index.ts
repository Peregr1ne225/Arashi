import Cookies from "js-cookie";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

const getApiUrl = (useDirectUrl = false) => {
  // If we are on the client and NOT using direct URL, use relative URL (proxied by Next.js)
  if (typeof window !== "undefined" && !useDirectUrl) {
    return "/api/v1";
  }

  // Server-side (SSR/RSC) or direct URL bypassing proxy: Use backend URL
  // Try environment variables first, fallback to localhost
  const url =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api/v1";
  return url.replace(/\/$/, "");
};

const API_URL = getApiUrl();

export const api = {
  get: async (endpoint: string, options: FetchOptions = {}) => {
    return request(endpoint, { ...options, method: "GET" });
  },

  post: async (endpoint: string, body: unknown, options: FetchOptions = {}) => {
    const isFormData = body instanceof FormData;
    // For FormData, bypass Next.js proxy to avoid corruption
    const apiUrl = isFormData ? getApiUrl(true) : API_URL;
    return request(endpoint, {
      ...options,
      apiUrl,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...options.headers,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  },

  put: async (endpoint: string, body: unknown, options: FetchOptions = {}) => {
    const isFormData = body instanceof FormData;
    // For FormData, bypass Next.js proxy to avoid corruption
    const apiUrl = isFormData ? getApiUrl(true) : API_URL;
    return request(endpoint, {
      ...options,
      apiUrl,
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...options.headers,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  },

  patch: async (endpoint: string, body: unknown, options: FetchOptions = {}) => {
    const isFormData = body instanceof FormData;
    // For FormData, bypass Next.js proxy to avoid corruption
    const apiUrl = isFormData ? getApiUrl(true) : API_URL;
    return request(endpoint, {
      ...options,
      apiUrl,
      method: "PATCH",
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...options.headers,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  },

  delete: async (endpoint: string, options: FetchOptions = {}) => {
    return request(endpoint, { ...options, method: "DELETE" });
  },
};

async function request(
  endpoint: string,
  options: FetchOptions & { apiUrl?: string } = {},
) {
  const apiBaseUrl = options.apiUrl || API_URL;
  const isDirectRequest = !!options.apiUrl;

  // Use js-cookie to get token (works in browser)
  const token = Cookies.get("accessToken");
  const csrfToken = Cookies.get("csrftoken");

  const headers: Record<string, string> = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Add CSRF token for mutation requests if it exists
  if (
    csrfToken &&
    options.method &&
    !["GET", "HEAD", "OPTIONS", "TRACE"].includes(options.method.toUpperCase())
  ) {
    headers["X-CSRFToken"] = csrfToken;
  }

  // Log request details for debugging
  console.log(`[API] ${options.method || "GET"} ${apiBaseUrl}${endpoint}`);
  if (options.body && options.body instanceof FormData) {
    // FormData logging suppressed
  } else if (options.body) {
    console.log("[API] Request body:", options.body);
  }

  // For direct requests (bypassing proxy), use 'omit' credentials to avoid CORS issues
  // Cookies will be sent via Authorization header instead
  // For proxied requests, use 'include' credentials for same-origin cookie handling
  const config = {
    ...options,
    headers,
    credentials: isDirectRequest
      ? ("omit" as RequestCredentials)
      : ("include" as RequestCredentials),
  };

  let response = await fetch(`${apiBaseUrl}${endpoint}`, config);

  // Log response status
  console.log(
    `[API] Response status: ${response.status} ${response.statusText} for ${endpoint}`,
  );

  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = Cookies.get("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${apiBaseUrl}/auth/token/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          // Update cookies
          Cookies.set("accessToken", data.access, {
            expires: 7,
            secure: window.location.protocol === "https:",
            sameSite: "Strict",
          });

          // Retry original request with new token
          const retryHeaders = {
            ...config.headers,
            Authorization: `Bearer ${data.access}`,
          };

          response = await fetch(`${apiBaseUrl}${endpoint}`, {
            ...config,
            headers: retryHeaders,
          });
        } else {
          // Refresh failed, logout
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
  }

  // Log response body for errors
  if (!response.ok) {
    console.log(`[API] Error response for ${endpoint}:`);
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const errorText = await response.clone().text();
      console.log("[API] Error JSON:", errorText);
    } else {
      const errorText = await response.clone().text();
      console.log(
        "[API] Error text (first 500 chars):",
        errorText.substring(0, 500),
      );
    }
  }

  return response;
}
