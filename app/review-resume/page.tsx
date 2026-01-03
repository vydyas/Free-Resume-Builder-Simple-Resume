"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SharedHeader } from "@/components/shared-header";
import { ReviewResumeListSkeleton } from "@/components/review-resume/review-resume-list-skeleton";
import { PDFThumbnail } from "@/components/review-resume/pdf-thumbnail";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Copy, Check, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface Review {
  id: string;
  title: string;
  share_token: string;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

export default function ReviewResumePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    loadReviews();
  }, [isLoaded, isSignedIn, router]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/review-resume", {
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Failed to load reviews");
        return;
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    const title = prompt("Enter a title for this review:", file.name.replace(".pdf", "")) || file.name;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const response = await fetch("/api/review-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to upload resume");
        return;
      }

      await loadReviews();
      e.target.value = ""; // Reset file input
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`/api/review-resume/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete review");
        return;
      }

      await loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/review-resume/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isLoaded || loading) {
    return (
      <>
        <SharedHeader variant="builder" />
        <ReviewResumeListSkeleton />
      </>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <SharedHeader variant="builder" />

      <main className="flex-1 mt-16 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review My Resume</h1>
              <p className="mt-2 text-gray-600">
                Upload your resume and get feedback from reviewers
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload PDF"}
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your first resume to get started
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Your First Resume
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-500 hover:shadow-lg hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-300"
                >
                  {/* PDF Thumbnail */}
                  <div className="mb-3">
                    <PDFThumbnail pdfUrl={review.pdf_url} className="w-full max-w-full" />
                  </div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                        {review.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-900"
                            aria-label="Review options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => copyShareLink(review.share_token)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {copiedToken === review.share_token ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy Link
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/review-resume/${review.share_token}`)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(review.id)}
                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => copyShareLink(review.share_token)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      {copiedToken === review.share_token ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => router.push(`/review-resume/${review.share_token}`)}
                      variant="default"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

