"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { Smile, Meh, Frown, Star, Filter } from "lucide-react";
import { AdminListShimmer } from "@/components/admin/list-shimmer";

interface FeedbackItem {
  id: string;
  clerk_user_id: string | null;
  email: string | null;
  rating: number | null;
  mood: string | null;
  message: string | null;
  created_at: string;
  admin_reply?: string | null;
  updated_at?: string | null;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodFilter, setMoodFilter] = useState<"all" | "happy" | "neutral" | "sad">("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [replyFilter, setReplyFilter] = useState<"all" | "replied" | "unreplied">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "rating">("created_at");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [replyTarget, setReplyTarget] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch("/api/admin/feedback", {
          method: "GET",
          next: { revalidate: 30 },
        });
        if (response.ok) {
          const data = await response.json();
          setFeedback(data.feedback || []);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const renderMoodIcon = (mood: string | null) => {
    if (mood === "happy") return <Smile className="w-4 h-4 text-emerald-500" />;
    if (mood === "neutral") return <Meh className="w-4 h-4 text-amber-500" />;
    if (mood === "sad") return <Frown className="w-4 h-4 text-rose-500" />;
    return null;
  };

  const filteredAndSorted = useMemo(() => {
    const searchLower = search.toLowerCase();

    const filtered = feedback.filter((item) => {
      if (moodFilter !== "all" && item.mood !== moodFilter) return false;
      if (minRating > 0 && (item.rating || 0) < minRating) return false;
      if (replyFilter === "replied" && !item.admin_reply) return false;
      if (replyFilter === "unreplied" && item.admin_reply) return false;
      if (searchLower) {
        const haystack =
          (item.email || "") +
          " " +
          (item.message || "") +
          " " +
          (item.mood || "");
        if (!haystack.toLowerCase().includes(searchLower)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "created_at") {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return sortDirection === "desc" ? db - da : da - db;
      }
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      return sortDirection === "desc" ? rb - ra : ra - rb;
    });

    return sorted;
  }, [feedback, moodFilter, minRating, replyFilter, search, sortBy, sortDirection]);

  const toggleSort = (column: "created_at" | "rating") => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const openReplyModal = (item: FeedbackItem) => {
    setReplyTarget(item);
    setReplyText(item.admin_reply || "");
  };

  const closeReplyModal = () => {
    if (replySaving) return;
    setReplyTarget(null);
    setReplyText("");
  };

  const handleReplySave = async () => {
    if (!replyTarget || !replyTarget.email) return;
    try {
      setReplySaving(true);
      const response = await fetch(`/api/admin/feedback/${replyTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyText }),
      });
      if (!response.ok) {
        console.error("Failed to send feedback reply");
        return;
      }

      // Update local state so reply shows without full refresh
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === replyTarget.id ? { ...item, admin_reply: replyText } : item
        )
      );
      closeReplyModal();
    } catch (error) {
      console.error("Error sending feedback reply:", error);
    } finally {
      setReplySaving(false);
    }
  };

  if (loading) {
    return <AdminListShimmer />;
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          See what users are saying about SimpleResu.me.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          <Filter className="w-3 h-3" />
          <span>Filter &amp; search</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or message..."
            className="w-full sm:flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <select
            value={moodFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setMoodFilter(e.target.value as "all" | "happy" | "neutral" | "sad")
            }
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All moods</option>
            <option value="happy">Loved it</option>
            <option value="neutral">Okay</option>
            <option value="sad">Needs work</option>
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value={0}>All ratings</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
            <option value={5}>5 stars only</option>
          </select>
          <select
            value={replyFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setReplyFilter(e.target.value as "all" | "replied" | "unreplied")
            }
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All feedback</option>
            <option value="replied">Replied only</option>
            <option value="unreplied">Not replied yet</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3 text-xs text-gray-500">
        Showing {filteredAndSorted.length} of {feedback.length} feedback entries
      </div>

      {feedback.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 text-sm">
          No feedback yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("created_at")}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      Date
                      <span className="text-[10px]">
                        {sortBy === "created_at" ? (sortDirection === "desc" ? "▼" : "▲") : ""}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Mood</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("rating")}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      Rating
                      <span className="text-[10px]">
                        {sortBy === "rating" ? (sortDirection === "desc" ? "▼" : "▲") : ""}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Message</th>
                  <th className="px-4 py-3 text-left">Reply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSorted.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top text-xs text-gray-600 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700">
                      {item.email || "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="inline-flex items-center gap-1 text-xs text-gray-600">
                        {renderMoodIcon(item.mood)}
                        <span className="capitalize">{item.mood || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700">
                      {item.rating ? (
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{item.rating}/5</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-700 max-w-xs">
                      {item.message ? (
                        <p className="line-clamp-3 whitespace-pre-line">{item.message}</p>
                      ) : (
                        "—"
                      )}
                    </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-700 max-w-xs">
                    {item.email ? (
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => openReplyModal(item)}
                          className="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-300 text-[11px] hover:bg-gray-50"
                        >
                          {item.admin_reply ? "View / Edit reply" : "Reply"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[11px]">No email</span>
                    )}
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reply modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reply to feedback</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {replyTarget.email || "Unknown user"} •{" "}
                  {new Date(replyTarget.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReplyModal}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {replyTarget.message && (
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-700 mb-1">
                    User feedback
                  </p>
                  <p className="text-xs text-gray-700 whitespace-pre-line">
                    {replyTarget.message}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Your reply (sent via email)
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Write a short, friendly reply to this user."
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeReplyModal}
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReplySave}
                disabled={replySaving || !replyText.trim()}
                className="px-4 py-1.5 rounded-md bg-black text-white text-xs sm:text-sm hover:bg-zinc-800 disabled:opacity-60"
              >
                {replySaving ? "Sending..." : "Send reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
