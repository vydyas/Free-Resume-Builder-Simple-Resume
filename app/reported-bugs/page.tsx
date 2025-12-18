"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Bug, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BugReport {
  id: string;
  page_url: string | null;
  description: string;
  screenshot_url: string | null;
  status: string | null;
  admin_comment: string | null;
  created_at: string;
  updated_at: string | null;
}

export default function ReportedBugsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchBugs = async () => {
      try {
        const response = await fetch("/api/user/bug-reports", {
          method: "GET",
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setBugs(data.bugs || []);
        }
      } catch (error) {
        console.error("Error fetching user bug reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to view your bug reports</h1>
          <p className="text-sm text-gray-600 mb-4">
            You need an account to see the bugs you have reported.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/40 to-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Your bug reports</h1>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {loading ? (
          <p className="text-sm text-gray-500">Loading your bug reports...</p>
        ) : bugs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
            You haven&apos;t reported any bugs yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bugs.map((bug) => (
              <div
                key={bug.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    <Bug className="w-3 h-3" />
                    <span>{new Date(bug.created_at).toLocaleString()}</span>
                  </span>
                  {bug.status && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                      <Clock className="w-3 h-3" />
                      <span className="capitalize">{bug.status}</span>
                    </span>
                  )}
                </div>

                {bug.page_url && (
                  <a
                    href={bug.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-xs sm:max-w-md">{bug.page_url}</span>
                  </a>
                )}

                <p className="text-sm text-gray-800 whitespace-pre-line">{bug.description}</p>

                {bug.admin_comment && (
                  <div className="mt-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">
                    <span className="font-semibold">Update from SimpleResu.me:</span>{" "}
                    <span>{bug.admin_comment}</span>
                  </div>
                )}

                {bug.screenshot_url && (
                  <div className="mt-2">
                    <a
                      href={bug.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                    >
                      <Image
                        src={bug.screenshot_url}
                        alt="Bug screenshot"
                        width={240}
                        height={180}
                        className="mt-1 max-h-40 rounded border border-gray-200 object-contain bg-gray-50 w-auto h-auto"
                      />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
