import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "../../lib/supabase-server";

const getCachedBugReports = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("bug_reports")
      .select("id, clerk_user_id, email, page_url, description, screenshot_url, status, admin_comment, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  },
  ["admin-bug-reports"],
  { revalidate: 60, tags: ["admin-bug-reports"] }
);

export async function GET() {
  try {
    const bugs = await getCachedBugReports();
    const response = NextResponse.json({ bugs });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );
    return response;
  } catch (error) {
    console.error("[Admin Bug Reports] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bug reports" },
      { status: 500 }
    );
  }
}
