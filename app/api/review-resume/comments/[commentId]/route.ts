import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../../lib/supabase-server";

// PUT: Update a comment (only by the comment author)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { commentId } = await params;
    const body = await request.json();
    const { comment_text } = body;

    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
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

    // Get the comment and verify ownership
    const { data: comment, error: commentError } = await supabaseAdmin
      .from("resume_review_comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify the user owns this comment
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized. You can only edit your own comments." }, { status: 403 });
    }

    // Update the comment
    const { data: updatedComment, error: updateError } = await supabaseAdmin
      .from("resume_review_comments")
      .update({
        comment_text: comment_text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select()
      .single();

    if (updateError) {
      console.error("[ReviewComments] Update error:", updateError);
      return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
    }

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error("[ReviewComments] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a comment (only by the comment author)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { commentId } = await params;

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the comment and verify ownership
    const { data: comment, error: commentError } = await supabaseAdmin
      .from("resume_review_comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify the user owns this comment
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized. You can only delete your own comments." }, { status: 403 });
    }

    // Delete the comment (cascade will handle replies)
    const { error: deleteError } = await supabaseAdmin
      .from("resume_review_comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("[ReviewComments] Delete error:", deleteError);
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ReviewComments] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


