"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Edit, Trash2, MoreVertical, Plus } from "lucide-react";
import { CommentModal } from "./comment-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: string;
  user_id: string | null;
  comment_text: string;
  reviewer_name: string | null;
  reviewer_email: string | null;
  parent_comment_id: string | null;
  created_at: string;
}

interface CommentSidebarProps {
  shareToken: string;
}

export function CommentSidebar({ shareToken }: CommentSidebarProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/review-resume/public/${shareToken}/comments`);
      if (!response.ok) {
        console.error("Failed to load comments");
        return;
      }

      const data = await response.json();
      setComments(data.comments || []);
      setCurrentUserDbId(data.current_user_id || null); // Store current user's DB ID
      setLoading(false);
    } catch (error) {
      console.error("Error loading comments:", error);
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    loadComments();
    // Poll for new comments every 5 seconds
    const interval = setInterval(loadComments, 5000);
    return () => clearInterval(interval);
  }, [loadComments]);

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setCommentModalOpen(true);
  };

  const handleAddComment = () => {
    setEditingComment(null);
    setCommentModalOpen(true);
  };

  const handleCommentAdded = () => {
    loadComments();
  };

  const handleCommentUpdated = () => {
    setEditingComment(null);
    loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      const response = await fetch(`/api/review-resume/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          router.push("/sign-in");
          return;
        }
        alert(error.error || "Failed to delete comment");
        return;
      }

      await loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Check if current user owns the comment
  const canEditComment = (comment: Comment) => {
    return isSignedIn && comment.user_id !== null && currentUserDbId !== null && comment.user_id === currentUserDbId;
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group comments by parent (threaded)
  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const repliesMap = new Map<string, Comment[]>();
  comments.forEach((comment) => {
    if (comment.parent_comment_id) {
      if (!repliesMap.has(comment.parent_comment_id)) {
        repliesMap.set(comment.parent_comment_id, []);
      }
      repliesMap.get(comment.parent_comment_id)!.push(comment);
    }
  });

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Comments ({comments.length})
            </h2>
          </div>
          <Button
            onClick={handleAddComment}
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Comment
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading comments...</p>
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {comment.reviewer_name || "Anonymous User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {canEditComment(comment) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              disabled={deletingCommentId === comment.id}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditComment(comment)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              disabled={deletingCommentId === comment.id}
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: comment.comment_text }}
                    />
                  </div>
                </div>

                {/* Replies */}
                {repliesMap.has(comment.id) && (
                  <div className="ml-11 mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
                    {repliesMap.get(comment.id)!.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {reply.reviewer_name || "Anonymous User"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            {canEditComment(reply) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    disabled={deletingCommentId === reply.id}
                                  >
                                    <MoreVertical className="w-3 h-3 text-gray-500" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditComment(reply)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                    disabled={deletingCommentId === reply.id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {deletingCommentId === reply.id ? "Deleting..." : "Delete"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <div
                            className="prose prose-sm max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ __html: reply.comment_text }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CommentModal
        open={commentModalOpen}
        onOpenChange={setCommentModalOpen}
        shareToken={shareToken}
        onCommentAdded={handleCommentAdded}
        editingCommentId={editingComment?.id || null}
        initialCommentText={editingComment?.comment_text || ""}
        onCommentUpdated={handleCommentUpdated}
      />
    </div>
  );
}

