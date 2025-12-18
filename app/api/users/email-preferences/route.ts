import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../lib/supabase-server";

/**
 * GET /api/users/email-preferences
 * Get user's email subscription preference
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email_subscription_enabled")
      .eq("clerk_user_id", userId)
      .single();

    if (error) {
      console.error("[Email Preferences] Error fetching user:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      emailSubscriptionEnabled: user.email_subscription_enabled ?? true, // Default to true if null
    });
  } catch (error) {
    console.error("[Email Preferences] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/email-preferences
 * Update user's email subscription preference
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailSubscriptionEnabled } = body;

    if (typeof emailSubscriptionEnabled !== "boolean") {
      return NextResponse.json(
        { error: "emailSubscriptionEnabled must be a boolean" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update({ email_subscription_enabled: emailSubscriptionEnabled })
      .eq("clerk_user_id", userId)
      .select("id, email_subscription_enabled")
      .single();

    if (error) {
      console.error("[Email Preferences] Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      emailSubscriptionEnabled: user.email_subscription_enabled,
    });
  } catch (error) {
    console.error("[Email Preferences] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


