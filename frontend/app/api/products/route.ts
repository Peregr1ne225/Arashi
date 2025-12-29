import { NextRequest, NextResponse } from "next/server";
import { productsApi } from "@/app/lib/api/client";
import { ProductListResponse, Product } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Add default values for pagination
    if (!query.page) query.page = "1";
    if (!query.page_size) query.page_size = "20";

    // Handle different API endpoints based on parameters
    let results: ProductListResponse | Product[];

    if (query.q) {
      // Handle search endpoint - use searchProducts method
      // This ensures we get properly formatted search results
      const products = await productsApi.searchProducts(query.q as string);
      // Convert to ProductListResponse format
      results = {
        count: products.length,
        next: null,
        previous: null,
        results: products,
      };
    } else if (query.featured) {
      // Handle featured products
      const products = await productsApi.getFeaturedProducts(
        parseInt(query.featured),
      );
      // Convert to ProductListResponse format
      results = {
        count: products.length,
        next: null,
        previous: null,
        results: products,
      };
    } else if (query.new_arrivals) {
      // Handle new arrivals
      const products = await productsApi.getNewArrivals(
        parseInt(query.new_arrivals),
      );
      // Convert to ProductListResponse format
      results = {
        count: products.length,
        next: null,
        previous: null,
        results: products,
      };
    } else if (query.bestsellers) {
      // Handle bestsellers
      const products = await productsApi.getBestsellers(
        parseInt(query.bestsellers),
      );
      // Convert to ProductListResponse format
      results = {
        count: products.length,
        next: null,
        previous: null,
        results: products,
      };
    } else {
      // Handle regular products with query parameters
      results = await productsApi.getProducts(query);
    }

    return NextResponse.json({
      data: results,
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Products API error:", error);

    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      },
      { status: 500 },
    );
  }
}

// Handle POST requests for creating products (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // This would be implemented when we have authentication and authorization
    // For now, we'll just return a not implemented response

    return NextResponse.json(
      {
        data: null,
        error: "Not implemented",
        status: 501,
      },
      { status: 501 },
    );
  } catch (error) {
    console.error("Products POST error:", error);

    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      },
      { status: 500 },
    );
  }
}

// Revalidate cache for products when needed
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags } = body;

    if (tags && Array.isArray(tags)) {
      // Revalidate cache for specific tags
      const { revalidateCache } = await import("@/app/lib/api/client");
      await revalidateCache(tags);
    }

    return NextResponse.json({
      data: { success: true },
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Products DELETE error:", error);

    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      },
      { status: 500 },
    );
  }
}
