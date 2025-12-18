import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const formData = await request.formData();

    const description = String(formData.get("description") || "");
    const pageUrl = String(formData.get("pageUrl") || "");
    const email = String(formData.get("email") || "");
    const file = formData.get("screenshot") as File | null;

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    let screenshotUrl: string | null = null;

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const fileName = `${Date.now()}-${file.name}`;

      // Upload the raw ArrayBuffer to Supabase Storage
      const { data, error: uploadError } = await supabaseAdmin.storage
        .from("bug-screenshots")
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error("[BugReport] Upload error:", uploadError);
      } else if (data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("bug-screenshots")
          .getPublicUrl(data.path);
        screenshotUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabaseAdmin.from("bug_reports").insert({
      clerk_user_id: userId || null,
      email: email || null,
      page_url: pageUrl || null,
      description,
      screenshot_url: screenshotUrl,
      status: "open",
    });

    if (error) {
      console.error("[BugReport] Insert error:", error);
      return NextResponse.json({ error: "Failed to save bug report" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BugReport] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
