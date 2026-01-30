import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  // Skip build-time image optimization for external images to speed up builds
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ltwebstatic.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
    ],
    // Disable image optimization for external images to speed up build
    unoptimized: process.env.NODE_ENV === "development",
  },
  devIndicators: {
    position: "bottom-left",
  },
  // Allow all ngrok domains for Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Proxy API requests to the backend
  async rewrites() {
    const rawBackendUrl =
      process.env.BACKEND_URL || "http://backend:8000/api/v1";
    // Normalize: remove trailing slash
    const normalizedUrl = rawBackendUrl.replace(/\/$/, "");
    // Extract base URL (remove /api/v1 if present to avoid duplication)
    const baseUrl = normalizedUrl.replace(/\/api\/v1$/, "");

    return [
      {
        source: "/api/v1/:path*/",
        destination: `${baseUrl}/api/v1/:path*/`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${baseUrl}/api/v1/:path*/`, // Force trailing slash
      },
      // Specific fixes for auth endpoints requiring trailing slash
      {
        source: "/api/v1/auth/profile",
        destination: `${baseUrl}/api/v1/auth/profile/`,
      },
      {
        source: "/api/v1/auth/user",
        destination: `${baseUrl}/api/v1/auth/user/`,
      },
      {
        source: "/api/v1/auth/token",
        destination: `${baseUrl}/api/v1/auth/token/`,
      },
      // Fallback for requests without v1 prefix (maps to v1)
      {
        source: "/api/:path*/",
        destination: `${baseUrl}/api/v1/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${baseUrl}/api/v1/:path*/`, // Force trailing slash
      },
      // Proxy media files
      {
        source: "/media/:path*",
        destination: `${baseUrl}/media/:path*`,
      },
    ];
  },
  // Optimize for production
  ...(process.env.NODE_ENV === "production" && {
    // Production-specific optimizations
    compiler: {
      // Remove console logs in production
      removeConsole: {
        exclude: ["error", "warn"],
      },
    },
  }),
};

export default nextConfig;
