import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../lib/supabase-server";

/**
 * GET /api/users/preferences
 * Get user's preferences (email subscription, name, etc.)
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
      .select("id, email_subscription_enabled, first_name, last_name")
      .eq("clerk_user_id", userId)
      .single();

    if (error) {
      console.error("[User Preferences] Error fetching user:", error);
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
      emailSubscriptionEnabled: user.email_subscription_enabled ?? true,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
    });
  } catch (error) {
    console.error("[User Preferences] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/preferences
 * Update user's preferences
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
    const { emailSubscriptionEnabled, firstName, lastName } = body;

    const updateData: {
      email_subscription_enabled?: boolean;
      first_name?: string;
      last_name?: string;
    } = {};

    // Only update emailSubscriptionEnabled if provided
    if (typeof emailSubscriptionEnabled === "boolean") {
      updateData.email_subscription_enabled = emailSubscriptionEnabled;
    }

    if (firstName !== undefined) {
      updateData.first_name = firstName.trim() || null;
    }

    if (lastName !== undefined) {
      updateData.last_name = lastName.trim() || null;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("clerk_user_id", userId)
      .select("id, email_subscription_enabled, first_name, last_name")
      .single();

    if (error) {
      console.error("[User Preferences] Error updating user:", error);
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
      firstName: user.first_name || "",
      lastName: user.last_name || "",
    });
  } catch (error) {
    console.error("[User Preferences] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


