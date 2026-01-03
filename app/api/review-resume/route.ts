import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../lib/supabase-server";
import crypto from "crypto";

// Generate a secure random token for shareable links
function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// GET: List all reviews for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all reviews for this user (hard deletes mean no need to filter by is_active)
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from("resume_reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("[ReviewResume] Error fetching reviews:", reviewsError);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error("[ReviewResume] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Upload a new PDF resume for review
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "Untitled Review");
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upload PDF to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const fileName = `resume-reviews/${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("resume-reviews")
      .upload(fileName, arrayBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("[ReviewResume] Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("resume-reviews")
      .getPublicUrl(uploadData.path);

    const pdfUrl = publicUrlData.publicUrl;

    // Generate share token
    const shareToken = generateShareToken();

    // Create review record
    const { data: review, error: insertError } = await supabaseAdmin
      .from("resume_reviews")
      .insert({
        user_id: user.id,
        title,
        pdf_url: pdfUrl,
        share_token: shareToken,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[ReviewResume] Insert error:", insertError);
      // Try to delete uploaded file if database insert fails
      await supabaseAdmin.storage.from("resume-reviews").remove([uploadData.path]);
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[ReviewResume] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

