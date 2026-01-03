"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Smile, Meh, Frown, Star, CheckCircle2, XCircle, X } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const moods = [
  { id: "happy", icon: Smile, label: "Loved it" },
  { id: "neutral", icon: Meh, label: "It was okay" },
  { id: "sad", icon: Frown, label: "Needs work" },
];

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [mood, setMood] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          mood,
          message,
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (response.ok) {
        setStatus({ type: "success", message: "Thank you for your feedback!" });
        setRating(0);
        setHoverRating(0);
        setMood(null);
        setMessage("");
        setTimeout(() => {
          onOpenChange(false);
        }, 1200);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to submit" }));
        setStatus({
          type: "error",
          message: errorData.error || "Failed to submit feedback",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
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
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Share feedback</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Help us improve SimpleResu.me
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close feedback modal"
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
            {/* Mood */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                How was your experience?
              </label>
              <div className="flex gap-2 sm:gap-3">
                {moods.map((item) => {
                  const Icon = item.icon;
                  const selected = mood === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMood(item.id)}
                      className={`flex flex-col items-center px-2.5 py-2 rounded-xl border text-[11px] sm:text-xs transition-colors ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/60"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mb-0.5 ${
                          selected ? "text-emerald-600" : "text-gray-500"
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Overall rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (hoverRating || rating) >= star
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs text-gray-500">
                  {rating ? `${rating} / 5` : "Tap to rate"}
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Anything else you&apos;d like to share?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Feature requests, things that confused you, what you loved, or what we should improve."
              />
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

