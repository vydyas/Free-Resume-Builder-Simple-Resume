import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../lib/supabase-server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("bug_reports")
      .select("id, page_url, description, screenshot_url, status, admin_comment, created_at, updated_at")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[User BugReports] Error:", error);
      return NextResponse.json({ error: "Failed to fetch bug reports" }, { status: 500 });
    }

    return NextResponse.json({ bugs: data || [] });
  } catch (error) {
    console.error("[User BugReports] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
