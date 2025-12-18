"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Bug, Upload, CheckCircle2, XCircle, X } from "lucide-react";

interface ReportBugModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportBugModal({ open, onOpenChange }: ReportBugModalProps) {
  const { user } = useUser();
  const [description, setDescription] = useState("");
  const [pageUrl, setPageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    if (submitting) return;
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("pageUrl", pageUrl || "");
      formData.append("email", user?.primaryEmailAddress?.emailAddress || "");
      if (file) {
        formData.append("screenshot", file);
      }

      const response = await fetch("/api/bug-report", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus({ type: "success", message: "Bug report submitted. Thank you!" });
        setDescription("");
        setFile(null);
        setTimeout(() => {
          onOpenChange(false);
        }, 1200);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to submit" }));
        setStatus({
          type: "error",
          message: errorData.error || "Failed to submit bug report",
        });
      }
    } catch (error) {
      console.error("Error submitting bug report:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <Bug className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Report a bug</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Found something broken? Let us know.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close bug report modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 sm:py-5">
          {status && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Page URL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Page URL
              </label>
              <input
                type="url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="https://simpleresu.me/..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                What went wrong? <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Tell us what you were doing, what you expected to happen, and what actually happened."
                required
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Screenshot (optional)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-xs sm:text-sm text-gray-700 cursor-pointer hover:border-rose-400 hover:bg-rose-50/40 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{file ? file.name : "Upload screenshot"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0] || null;
                      setFile(selected);
                    }}
                  />
                </label>
                <p className="text-[11px] text-gray-500">
                  PNG or JPG up to a few MB is perfect.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-black text-white text-xs sm:text-sm font-medium hover:bg-zinc-800 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
