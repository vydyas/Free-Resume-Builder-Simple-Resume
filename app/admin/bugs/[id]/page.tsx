"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bug, ExternalLink } from "lucide-react";
import Image from "next/image";
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

export default function AdminBugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bugId = params?.id as string;

  const [bug, setBug] = useState<BugReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBug = async () => {
      try {
        const response = await fetch(`/api/admin/bug-reports/${bugId}`, {
          method: "GET",
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setBug(data.bug || null);
        }
      } catch (error) {
        console.error("Error fetching bug:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bugId) {
      fetchBug();
    }
  }, [bugId]);

  const handleSave = async () => {
    if (!bug) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/bug-reports/${bug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: bug.status || "open",
          adminComment: bug.admin_comment || null,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setBug(data.bug || bug);
      }
    } catch (error) {
      console.error("Error saving bug:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminListShimmer />;
  }

  if (!bug) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => router.push("/admin/bugs")}
          className="mb-4 text-sm text-gray-600 hover:text-black"
        >
          ← Back to Bug Reports
        </button>
        <p className="text-sm text-gray-600">Bug not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => router.push("/admin/bugs")}
        className="mb-4 text-sm text-gray-600 hover:text-black"
      >
        ← Back to Bug Reports
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Bug className="w-5 h-5 text-rose-500" />
          <span className="font-medium">Bug details</span>
          <span>• {new Date(bug.created_at).toLocaleString()}</span>
        </div>

        <div className="text-sm text-gray-700">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-medium">Status:</span>
            <select
              value={bug.status || "open"}
              onChange={(e) => setBug({ ...bug, status: e.target.value })}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs"
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="mb-2 text-xs text-gray-500">
            {bug.email && <span className="mr-2">Reporter: {bug.email}</span>}
          </div>
        </div>

        {bug.page_url && (
          <div className="text-xs text-emerald-700">
            <a
              href={bug.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-emerald-900"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-xs sm:max-w-md">{bug.page_url}</span>
            </a>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Description</h2>
          <p className="text-sm text-gray-800 whitespace-pre-line">{bug.description}</p>
        </div>

        {bug.screenshot_url && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Screenshot</h2>
            <a
              href={bug.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
            >
              <Image
                src={bug.screenshot_url}
                alt="Bug screenshot"
                width={320}
                height={240}
                className="mt-1 max-h-64 rounded border border-gray-200 object-contain bg-gray-50 w-auto h-auto"
              />
            </a>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Admin comment</h2>
          <textarea
            value={bug.admin_comment || ""}
            onChange={(e) => setBug({ ...bug, admin_comment: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Add context for the team and a note that will be emailed to the user."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-black text-white text-sm hover:bg-zinc-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save & notify user"}
          </button>
        </div>
      </div>
    </div>
  );
}
