"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { AdminListShimmer } from "@/components/admin/list-shimmer";

interface BugReport {
  id: string;
  clerk_user_id: string | null;
  email: string | null;
  page_url: string | null;
  description: string;
  screenshot_url: string | null;
  created_at: string;
  status?: string | null;
  admin_comment?: string | null;
}

export default function AdminBugsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"open" | "all" | "in_progress" | "resolved" | "closed">("open");

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const response = await fetch("/api/admin/bug-reports", {
          method: "GET",
          next: { revalidate: 30 },
        });
        if (response.ok) {
          const data = await response.json();
          setBugs(data.bugs || []);
        }
      } catch (error) {
        console.error("Error fetching bug reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return bugs;
    return bugs.filter((b) => (b.status || "open") === statusFilter);
  }, [bugs, statusFilter]);

  if (loading) {
    return <AdminListShimmer />;
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bug Reports</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Track and investigate issues reported by users.
        </p>
      </div>

      {/* Status filter */}
      <div className="mb-4 bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
        <span className="font-medium">Status:</span>
        <select
          value={statusFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value as "open" | "all" | "in_progress" | "resolved" | "closed")
          }
          className="border border-gray-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
        <span className="text-xs text-gray-500">
          Showing {filtered.length} of {bugs.length} bugs
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 text-sm">
          No bug reports yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Page</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Screenshot</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((bug) => (
                  <tr key={bug.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top text-xs text-gray-600 whitespace-nowrap">
                      {new Date(bug.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700">
                      {bug.email || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {bug.status || "open"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-emerald-700 max-w-xs">
                      {bug.page_url ? (
                        <a
                          href={bug.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-emerald-900"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[180px]">{bug.page_url}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700 max-w-xs">
                      <p className="line-clamp-3 whitespace-pre-line">{bug.description}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700">
                      {bug.screenshot_url ? (
                        <a
                          href={bug.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        >
                          <Image
                            src={bug.screenshot_url}
                            alt="Bug screenshot"
                            width={160}
                            height={120}
                            className="mt-1 max-h-16 rounded border border-gray-200 object-contain bg-gray-50 w-auto h-auto"
                          />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      <Link
                        href={`/admin/bugs/${bug.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
