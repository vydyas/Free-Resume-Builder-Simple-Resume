import { Shimmer } from "@/components/ui/shimmer";

interface DashboardSkeletonProps {
  viewMode?: "grid" | "list";
}

export function DashboardSkeleton({ viewMode }: DashboardSkeletonProps) {
  // Get view mode from localStorage if not provided, default to grid
  const currentViewMode = viewMode || (typeof window !== "undefined" 
    ? (localStorage.getItem("dashboardViewMode") === "list" ? "list" : "grid")
    : "grid");
  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex-1 mt-16 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <Shimmer className="h-9 w-48 mb-2" />
              <Shimmer className="h-5 w-64" />
            </div>
            <div className="flex items-center gap-3">
              <Shimmer className="h-10 w-20 rounded-lg" />
              <Shimmer className="h-10 w-40" />
            </div>
          </div>

          {/* Resumes Skeleton */}
          {currentViewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Shimmer className="h-6 w-32 mb-2" />
                      <Shimmer className="h-4 w-24" />
                    </div>
                    <Shimmer className="h-8 w-8 rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Shimmer className="h-4 w-28" />
                    <Shimmer className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Shimmer className="h-8 w-8 rounded" />
                      <div className="flex-1">
                        <Shimmer className="h-6 w-48 mb-2" />
                        <div className="flex items-center gap-4">
                          <Shimmer className="h-4 w-32" />
                          <Shimmer className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                    <Shimmer className="h-8 w-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

