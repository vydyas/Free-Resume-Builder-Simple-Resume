import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-server";
import { errorResponse } from "../../lib/errors";
import { sendCustomEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, subject, content } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    // Fetch users by IDs - only include users who have opted in to emails
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, email_subscription_enabled, first_name, last_name")
      .in("id", userIds)
      .eq("email_subscription_enabled", true); // Only send to users who opted in

    if (error) {
      console.error("[Admin] Error fetching users:", error);
      throw error;
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "No users found" },
        { status: 404 }
      );
    }

    // Send emails to all users
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const user of users) {
      const result = await sendCustomEmail({
        to: user.email,
        subject,
        html: content,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${user.email}: ${result.error || "Unknown error"}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Admin] Error sending emails:", error);
    return errorResponse(error);
  }
}


