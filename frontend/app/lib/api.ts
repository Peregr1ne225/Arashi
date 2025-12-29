const getApiUrl = () => {
  // If we are on the client, use relative URL (proxied by Next.js)
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  // Server-side (SSR/RSC): Use internal docker URL
  let url = process.env.INTERNAL_API_URL || "http://backend:8000/api/v1";
  return url.replace(/\/$/, "");
};

const API_URL = getApiUrl();
import Cookies from "js-cookie";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const api = {
  get: async (endpoint: string, options: FetchOptions = {}) => {
    return request(endpoint, { ...options, method: "GET" });
  },
  post: async (endpoint: string, body: any, options: FetchOptions = {}) => {
    const isFormData = body instanceof FormData;
    return request(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...options.headers,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  },
  put: async (endpoint: string, body: any, options: FetchOptions = {}) => {
    const isFormData = body instanceof FormData;
    return request(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...options.headers,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  },
  patch: async (endpoint: string, body: any, options: FetchOptions = {}) => {
    const isFormData = body instanceof FormData;
    return request(endpoint, {
      ...options,
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

/*
  Manual getCookie removed in favor of js-cookie
*/

async function request(endpoint: string, options: FetchOptions = {}) {
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

  const config = {
    ...options,
    headers,
    credentials: "include" as RequestCredentials, // Ensure cookies are sent with request
  };

  let response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Try to refresh the token
    const refreshToken = Cookies.get("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/token/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          // Update cookies
          Cookies.set("accessToken", data.access, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });

          // Retry the original request with the new token
          const retryHeaders = {
            ...config.headers,
            Authorization: `Bearer ${data.access}`,
          };

          response = await fetch(`${API_URL}${endpoint}`, {
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

  return response;
}
