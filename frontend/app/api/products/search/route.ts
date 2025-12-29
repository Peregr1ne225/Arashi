import { NextRequest, NextResponse } from "next/server";
import { productsApi } from "@/app/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Extract all search parameters
    const params: Record<string, string | number> = {
      page_size: searchParams.get("page_size") || "50",
    };

    // Add search query if provided
    if (query && query.trim()) {
      params.q = query.trim();
    }

    // Add optional filters
    const category = searchParams.get("category");
    if (category) {
      params.category = category;
    }

    const minPrice = searchParams.get("min_price");
    if (minPrice) {
      params.min_price = Number(minPrice);
    }

    const maxPrice = searchParams.get("max_price");
    if (maxPrice) {
      params.max_price = Number(maxPrice);
    }

    const ordering = searchParams.get("ordering");
    if (ordering) {
      params.ordering = ordering;
    }

    const page = searchParams.get("page");
    if (page) {
      params.page = Number(page);
    }

    // Use the productsApi to get products with all parameters including search query
    const results = await productsApi.getProducts(params);

    return NextResponse.json({
      data: results,
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Products search API error:", error);

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
