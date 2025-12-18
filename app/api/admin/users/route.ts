import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "../../lib/supabase-server";

// Cached function to fetch users
const getCachedUsers = unstable_cache(
  async () => {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, clerk_user_id, created_at, updated_at, email_subscription_enabled, first_name, last_name")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return users || [];
  },
  ["admin-users"], // Cache key
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ["admin-users"], // Cache tag for invalidation
  }
);

export async function GET() {
  try {
    // In production, add proper admin authentication here
    // For now, we'll allow access from the admin dashboard
    
    const users = await getCachedUsers();

    // Set cache headers for browser/CDN caching
    const response = NextResponse.json({ users });
    
    // Cache for 30 seconds on client/CDN, revalidate in background
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );
    
    return response;
  } catch (error) {
    console.error("[Admin] Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


