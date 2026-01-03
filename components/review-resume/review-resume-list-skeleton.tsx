"use client";

import { Shimmer } from "@/components/ui/shimmer";

// Static skeleton without animation
const StaticShimmer = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <Shimmer {...props} animated={false} />
);

export function ReviewResumeListSkeleton() {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex-1 mt-16 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <StaticShimmer className="h-9 w-64 mb-2" />
              <StaticShimmer className="h-5 w-96" />
            </div>
            <StaticShimmer className="h-10 w-32 rounded-lg" />
          </div>

          {/* Reviews Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white border-2 border-gray-200 rounded-lg p-4"
              >
                {/* PDF Thumbnail Skeleton */}
                <div className="mb-3">
                  <StaticShimmer className="w-full rounded-lg" style={{ height: '320px' }} />
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <StaticShimmer className="h-4 w-24 mb-2" />
                    <StaticShimmer className="h-3 w-20" />
                  </div>
                  <StaticShimmer className="h-6 w-6 rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <StaticShimmer className="h-8 flex-1 rounded-lg" />
                  <StaticShimmer className="h-8 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

