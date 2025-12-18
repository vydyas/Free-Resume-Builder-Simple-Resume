import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getAllTemplates } from "@/lib/email-templates";

// Cached function to get templates (templates are static, cache for longer)
const getCachedTemplates = unstable_cache(
  async () => {
    return getAllTemplates();
  },
  ["admin-email-templates"], // Cache key
  {
    revalidate: 3600, // Revalidate every hour (templates rarely change)
    tags: ["admin-email-templates"], // Cache tag for invalidation
  }
);

export async function GET() {
  try {
    const templates = await getCachedTemplates();
    
    const response = NextResponse.json({ templates });
    
    // Cache templates for 1 hour on client/CDN (they're static)
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200"
    );
    
    return response;
  } catch (error) {
    console.error("[Admin] Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}


