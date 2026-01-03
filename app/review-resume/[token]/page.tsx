"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PDFViewer } from "@/components/review-resume/pdf-viewer";
import { CommentSidebar } from "@/components/review-resume/comment-sidebar";
import { ReviewResumeSkeleton } from "@/components/review-resume/review-resume-skeleton";
import { SharedHeader } from "@/components/shared-header";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

interface Review {
  id: string;
  title: string;
  pdf_url: string;
  share_token: string;
}

export default function ReviewResumePublicPage() {
  const params = useParams();
  const token = params.token as string;
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReview = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/review-resume/public/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Review not found");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setReview(data.review);
      setLoading(false);
    } catch (error) {
      console.error("Error loading review:", error);
      setError("Failed to load review");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  if (loading) {
    return (
      <>
        <SharedHeader variant="landing" />
        <ReviewResumeSkeleton />
      </>
    );
  }

  if (error || !review) {
    return (
      <div className="flex flex-col bg-white h-screen">
        <SharedHeader variant="landing" />
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Not Found</h1>
            <p className="text-gray-600 mb-4">{error || "The review you're looking for doesn't exist."}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white h-screen">
      <SharedHeader variant="landing" />
      
      <div className="flex-1 overflow-hidden mt-16">
        <div className="h-full px-4 py-4">
          <div className="h-[calc(100vh-8rem)]">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={60} minSize={40}>
                <div className="h-full pr-2">
                  <PDFViewer pdfUrl={review.pdf_url} />
                </div>
              </Panel>
              <PanelResizeHandle className="w-2 hover:bg-gray-300 transition-colors">
                <div className="w-1 h-full mx-auto bg-gray-200" />
              </PanelResizeHandle>
              <Panel defaultSize={40} minSize={30}>
                <div className="h-full pl-2">
                  <CommentSidebar shareToken={token} />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

