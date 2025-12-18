import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { rating, mood, message } = body;

    if (!rating && !mood && !message) {
      return NextResponse.json({ error: "No feedback provided" }, { status: 400 });
    }

    const email = body.email || undefined;

    const { error } = await supabaseAdmin.from("feedback").insert({
      clerk_user_id: userId || null,
      email: email || null,
      rating: rating ?? null,
      mood: mood ?? null,
      message: message ?? null,
    });

    if (error) {
      console.error("[Feedback] Insert error:", error);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Feedback] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
