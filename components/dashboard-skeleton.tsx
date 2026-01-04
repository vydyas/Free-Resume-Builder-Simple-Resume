"use client";

import React from "react";

interface DashboardSkeletonProps {
  viewMode?: "grid" | "list";
}

export function DashboardSkeleton({ viewMode }: DashboardSkeletonProps) {
  // Get view mode from localStorage if not provided, default to grid
  const [currentViewMode, setCurrentViewMode] = React.useState<"grid" | "list">("grid");
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboardViewMode");
      setCurrentViewMode((saved === "list" || saved === "grid") ? saved : (viewMode || "grid"));
    }
  }, [viewMode]);

  const displayMode = viewMode || currentViewMode;

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex-1 mt-16 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-9 w-48 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-64 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort Filter Skeleton */}
              <div className="h-9 w-[180px] bg-gray-200 rounded-md animate-pulse"></div>
              
              {/* View Toggle Skeleton */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <div className="h-8 w-8 bg-gray-300 rounded-md animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-md animate-pulse"></div>
              </div>
              
              {/* Create Button Skeleton */}
              <div className="h-10 w-32 bg-gray-300 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Resumes Skeleton */}
          {displayMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ gridAutoRows: '1fr' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col h-full animate-pulse"
                >
                  <div className="flex items-start justify-between mb-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="h-4 w-28 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Table Header Skeleton */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-1"></div>
                </div>
              </div>
              
              {/* Table Rows Skeleton */}
              <div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="px-6 py-4 border-b border-gray-200 last:border-b-0 animate-pulse"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Title with Icon */}
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300"></div>
                        <div className="h-4 w-32 bg-gray-300 rounded flex-1"></div>
                      </div>
                      
                      {/* Name */}
                      <div className="col-span-2">
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                      </div>
                      
                      {/* Created Date */}
                      <div className="col-span-2">
                        <div className="h-4 w-20 bg-gray-300 rounded"></div>
                      </div>
                      
                      {/* Updated Date */}
                      <div className="col-span-2">
                        <div className="h-4 w-20 bg-gray-300 rounded"></div>
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

