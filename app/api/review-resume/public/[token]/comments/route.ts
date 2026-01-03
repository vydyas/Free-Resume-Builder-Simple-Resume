import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../../../lib/supabase-server";

// GET: Get all comments for a review (public, no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { userId } = await auth();
    
    // Get current user's database ID if authenticated
    let currentUserDbId: string | null = null;
    if (userId) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("clerk_user_id", userId)
        .single();
      if (user) {
        currentUserDbId = user.id;
      }
    }

    // First verify the review exists and is active
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("resume_reviews")
      .select("id")
      .eq("share_token", token)
      .eq("is_active", true)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get all comments for this review (including replies)
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from("resume_review_comments")
      .select("*")
      .eq("review_id", review.id)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("[ReviewComments] Error fetching comments:", commentsError);
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }

    // Get user info for comments that have user_id
    interface CommentRow {
      user_id: string | null;
      [key: string]: unknown;
    }
    
    interface UserRow {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string;
    }
    
    const userIds = [...new Set((comments || []).filter((c: CommentRow) => c.user_id).map((c: CommentRow) => c.user_id))];
    const usersMap = new Map<string, UserRow>();
    
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      
      if (users) {
        users.forEach((user: UserRow) => {
          usersMap.set(user.id, user);
        });
      }
    }

    // Format comments to include user name (keep user_id for ownership checks)
    const formattedComments = (comments || []).map((comment: CommentRow) => {
      const user = comment.user_id ? usersMap.get(comment.user_id) : null;
      return {
        ...comment,
        user_id: comment.user_id, // Keep user_id for frontend ownership checks
        reviewer_name: (comment.reviewer_name as string) || (user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
          : null),
      };
    });

    return NextResponse.json({ 
      comments: formattedComments,
      current_user_id: currentUserDbId // Include current user's DB ID for ownership checks
    });
  } catch (error) {
    console.error("[ReviewComments] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Add a new comment (requires authentication)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Authentication required. Please sign in to comment." }, { status: 401 });
    }

    const { token } = await params;
    const body = await request.json();
    const { comment_text, parent_comment_id } = body;

    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First verify the review exists and is active
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("resume_reviews")
      .select("id")
      .eq("share_token", token)
      .eq("is_active", true)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // If parent_comment_id is provided, verify it exists and belongs to this review
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabaseAdmin
        .from("resume_review_comments")
        .select("id")
        .eq("id", parent_comment_id)
        .eq("review_id", review.id)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    // Insert comment with user_id
    const { data: comment, error: insertError } = await supabaseAdmin
      .from("resume_review_comments")
      .insert({
        review_id: review.id,
        user_id: user.id,
        comment_text: comment_text.trim(),
        reviewer_name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
        reviewer_email: user.email,
        parent_comment_id: parent_comment_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[ReviewComments] Insert error:", insertError);
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("[ReviewComments] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

