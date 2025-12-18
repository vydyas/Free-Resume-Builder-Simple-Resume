import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-server";
import { sendCustomEmail } from "@/lib/email";

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const feedbackId = segments[segments.length - 1];
    const body = await request.json();
    const { adminReply } = body as { adminReply?: string };

    if (adminReply === undefined) {
      return NextResponse.json({ error: "adminReply is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("feedback")
      .update({
        admin_reply: adminReply || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedbackId)
      .select("email, rating, mood, message, admin_reply, created_at")
      .single();

    if (error) {
      console.error("[Admin Feedback] Update error:", error);
      return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
    }

    if (data?.email) {
      const moodLabel = data.mood || "";
      const ratingLabel = data.rating ? `${data.rating}/5` : "";

      const detailsParts = [moodLabel && `Mood: ${moodLabel}`, ratingLabel && `Rating: ${ratingLabel}`].filter(Boolean);
      const detailsLine = detailsParts.length ? detailsParts.join(" · ") : "";

      const html = `
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">
          Thanks for your feedback on SimpleResu.me
        </h2>
        <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          We really appreciate you taking the time to share your thoughts.
        </p>
        ${detailsLine ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">${detailsLine}</p>` : ""}
        ${data.message ? `<p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-line;"><strong>Your feedback:</strong> ${data.message}</p>` : ""}
        ${data.admin_reply ? `<p style="margin: 16px 0 0 0; color: #111827; font-size: 14px; line-height: 1.6;"><strong>Our reply:</strong> ${data.admin_reply}</p>` : ""}
        <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
          You can always share more ideas or issues directly from the Feedback button in the app.
        </p>
      `;

      await sendCustomEmail({
        to: data.email,
        subject: "Thanks for your feedback on SimpleResu.me",
        html,
      });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (error) {
    console.error("[Admin Feedback] PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
