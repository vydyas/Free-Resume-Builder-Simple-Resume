import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../lib/supabase-server";

// GET: Get review details by ID (for authenticated user)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

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

    // Get review
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("resume_reviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("[ReviewResume] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

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

    // Get review to get PDF URL for deletion
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("resume_reviews")
      .select("pdf_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Delete the PDF file from storage first (before hard delete)
    // Extract path from Supabase public URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/resume-reviews/[user-id]/[filename]
    // The path for remove() should be relative to the bucket: [user-id]/[filename]
    let filePath: string | null = null;
    
    try {
      // Extract path after /public/
      const publicIndex = review.pdf_url.indexOf('/public/');
      if (publicIndex !== -1) {
        const fullPath = review.pdf_url.substring(publicIndex + '/public/'.length);
        // Remove the bucket name prefix (resume-reviews/) to get the relative path
        if (fullPath.startsWith('resume-reviews/')) {
          filePath = fullPath.substring('resume-reviews/'.length);
        } else {
          filePath = fullPath;
        }
      } else {
        // Fallback: Extract path after resume-reviews/
        const resumeReviewsIndex = review.pdf_url.indexOf('resume-reviews/');
        if (resumeReviewsIndex !== -1) {
          filePath = review.pdf_url.substring(resumeReviewsIndex + 'resume-reviews/'.length);
        }
      }

      // Delete file from storage if path was extracted
      if (filePath) {
        console.log("[ReviewResume] Attempting to delete file from storage");
        console.log("[ReviewResume] Extracted file path:", filePath);
        console.log("[ReviewResume] Original PDF URL:", review.pdf_url);
        
        const { error: storageError, data } = await supabaseAdmin.storage
          .from("resume-reviews")
          .remove([filePath]);
        
        if (storageError) {
          console.error("[ReviewResume] Storage delete error:", storageError);
          console.error("[ReviewResume] Error details:", JSON.stringify(storageError, null, 2));
          
          // Try with the full path including bucket name as fallback
          const fullPath = `resume-reviews/${filePath}`;
          console.log("[ReviewResume] Trying fallback with full path:", fullPath);
          const { error: fallbackError } = await supabaseAdmin.storage
            .from("resume-reviews")
            .remove([fullPath]);
          
          if (fallbackError) {
            console.error("[ReviewResume] Fallback delete also failed:", fallbackError);
          } else {
            console.log("[ReviewResume] Successfully deleted using fallback path:", fullPath);
          }
        } else {
          console.log("[ReviewResume] Successfully deleted file from storage:", filePath);
        }
      } else {
        console.warn("[ReviewResume] Could not extract file path from URL:", review.pdf_url);
      }
    } catch (storageErr) {
      console.error("[ReviewResume] Error deleting file from storage:", storageErr);
      // Continue with hard delete even if storage deletion fails
    }

    // Hard delete (permanently remove from database)
    // This will also cascade delete related comments due to ON DELETE CASCADE
    const { error: deleteError } = await supabaseAdmin
      .from("resume_reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[ReviewResume] Delete error:", deleteError);
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ReviewResume] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


