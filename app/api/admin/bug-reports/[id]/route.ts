import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-server";
import { sendCustomEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const bugId = segments[segments.length - 1];
    const { data, error } = await supabaseAdmin
      .from("bug_reports")
      .select("id, clerk_user_id, email, page_url, description, screenshot_url, status, admin_comment, created_at, updated_at")
      .eq("id", bugId)
      .single();

    if (error) {
      console.error("[Admin BugReports] GET error:", error);
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json({ bug: data });
  } catch (error) {
    console.error("[Admin BugReports] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const bugId = segments[segments.length - 1];
    const body = await request.json();
    const { status, adminComment } = body as {
      status?: string;
      adminComment?: string;
    };

    if (!status && adminComment === undefined) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (status) {
      updateData.status = status;
    }

    if (adminComment !== undefined) {
      updateData.admin_comment = adminComment || null;
    }

    const { data, error } = await supabaseAdmin
      .from("bug_reports")
      .update(updateData)
      .eq("id", bugId)
      .select("email, status, admin_comment, page_url, description, created_at")
      .single();

    if (error) {
      console.error("[Admin BugReports] Update error:", error);
      return NextResponse.json(
        { error: "Failed to update bug report" },
        { status: 500 }
      );
    }

    // Send email notification to user if we have an email
    if (data?.email) {
      const statusLabel = data.status || "updated";
      const commentText = data.admin_comment
        ? `<p style=\"margin: 0 0 16px 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;\">
            <strong>Note from the team:</strong> ${data.admin_comment}
           </p>`
        : "";

      const html = `
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">
          Update on your reported bug
        </h2>
        <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          We&apos;ve updated the status of a bug you reported on SimpleResu.me.
        </p>
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
          <strong>Status:</strong> ${statusLabel}
        </p>
        ${commentText}
        <p style="margin: 16px 0 8px 0; color: #6b7280; font-size: 13px;">
          <strong>Reported:</strong> ${new Date(data.created_at).toLocaleString()}
        </p>
        ${data.page_url ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;"><strong>Page:</strong> ${
          data.page_url
        }</p>` : ""}
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; white-space: pre-line;">
          <strong>Description:</strong> ${data.description || "(no description)"}
        </p>
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          You can also see the latest status of your bugs on the <a href="https://simpleresu.me/reported-bugs" style="color: #10b981; text-decoration: underline;">Reported Bugs</a> page.
        </p>
      `;

      await sendCustomEmail({
        to: data.email,
        subject: "Update on your reported bug",
        html,
      });
    }

    return NextResponse.json({ success: true, bug: data });
  } catch (error) {
    console.error("[Admin BugReports] PATCH Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
