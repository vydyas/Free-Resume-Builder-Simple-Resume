import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "../../lib/supabase-server";

const getCachedFeedback = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("feedback")
      .select("id, clerk_user_id, email, rating, mood, message, admin_reply, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  },
  ["admin-feedback"],
  { revalidate: 60, tags: ["admin-feedback"] }
);

export async function GET() {
  try {
    const feedback = await getCachedFeedback();
    const response = NextResponse.json({ feedback });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );
    return response;
  } catch (error) {
    console.error("[Admin Feedback] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
