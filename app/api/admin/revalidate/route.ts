import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * API route to manually invalidate admin cache
 * Usage: POST /api/admin/revalidate?tag=admin-users
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get("tag");

    if (!tag) {
      return NextResponse.json(
        { error: "Tag parameter is required" },
        { status: 400 }
      );
    }

    // Revalidate the cache tag
    revalidateTag(tag);

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for tag: ${tag}`,
    });
  } catch (error) {
    console.error("[Admin] Error revalidating cache:", error);
    return NextResponse.json(
      { error: "Failed to revalidate cache" },
      { status: 500 }
    );
  }
}


