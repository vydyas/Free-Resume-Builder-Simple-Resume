"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Send, LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareToken: string;
  onCommentAdded: () => void;
  editingCommentId?: string | null;
  initialCommentText?: string;
  onCommentUpdated?: () => void;
}

export function CommentModal({
  open,
  onOpenChange,
  shareToken,
  onCommentAdded,
  editingCommentId,
  initialCommentText = "",
  onCommentUpdated,
}: CommentModalProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set initial comment text when editing
  useEffect(() => {
    if (editingCommentId && initialCommentText) {
      setCommentText(initialCommentText);
    } else {
      setCommentText("");
    }
  }, [editingCommentId, initialCommentText, open]);

  const handleClose = () => {
    if (submitting) return;
    setCommentText("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingCommentId) {
        // Update existing comment
        const response = await fetch(`/api/review-resume/comments/${editingCommentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment_text: commentText,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (response.status === 401) {
            router.push("/sign-in");
            return;
          }
          alert(error.error || "Failed to update comment");
          return;
        }

        if (onCommentUpdated) {
          onCommentUpdated();
        }
      } else {
        // Create new comment
        const response = await fetch(`/api/review-resume/public/${shareToken}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment_text: commentText,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (response.status === 401) {
            router.push("/sign-in");
            return;
          }
          alert(error.error || "Failed to submit comment");
          return;
        }

        onCommentAdded();
      }

      setCommentText("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Please sign in to add or edit comments.
            </p>
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCommentId ? "Edit Comment" : "Add Comment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs text-gray-500">
            Commenting as: <span className="font-medium text-gray-700">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <RichTextEditor
            content={commentText}
            onChange={setCommentText}
            editable={true}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : editingCommentId ? "Update Comment" : "Post Comment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

