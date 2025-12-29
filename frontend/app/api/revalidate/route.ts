import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags, paths } = body;

    // Revalidate by tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag, "max");
      }
    }

    // Revalidate by paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: {
        tags: tags || [],
        paths: paths || [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

// Health check endpoint for revalidation
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation API is available",
  });
}
