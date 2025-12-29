import { NextRequest, NextResponse } from "next/server";
import { categoriesApi } from "@/app/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Handle different API endpoints based on parameters
    let results;

    if (query.id) {
      // Handle single category
      results = await categoriesApi.getCategory(parseInt(query.id as string));
    } else {
      // Handle all categories
      results = await categoriesApi.getCategories();
    }

    return NextResponse.json({
      data: results,
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Categories API error:", error);

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

// Handle POST requests for creating categories (admin only)
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
    console.error("Categories POST error:", error);

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

// Revalidate cache for categories when needed
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags } = body;

    if (tags && Array.isArray(tags)) {
      // Revalidate cache for specific tags
      const origin = new URL(request.url).origin;
      await fetch(
        `${origin}/api/revalidate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags }),
        },
      );
    }

    return NextResponse.json({
      data: { success: true },
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Categories DELETE error:", error);

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
