import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-server";

// GET: Get public review by share token (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Get review by share token
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("resume_reviews")
      .select("*")
      .eq("share_token", token)
      .eq("is_active", true)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if review has expired
    if (review.expires_at && new Date(review.expires_at) < new Date()) {
      return NextResponse.json({ error: "This review link has expired" }, { status: 410 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("[ReviewResume] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


