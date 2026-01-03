"use client";

import { Shimmer } from "@/components/ui/shimmer";

// Static skeleton without animation
const StaticShimmer = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <Shimmer {...props} animated={false} />
);
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export function ReviewResumeSkeleton() {
  return (
    <div className="flex flex-col bg-white h-screen">
      <div className="flex-1 overflow-hidden mt-16">
        <div className="h-full px-4 py-4">
          <div className="h-[calc(100vh-8rem)]">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={60} minSize={40}>
                <div className="h-full pr-2">
                  {/* PDF Viewer Skeleton */}
                  <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
                    {/* PDF Controls Skeleton */}
                    <div className="flex items-center justify-between p-4 bg-white border-b">
                      <StaticShimmer className="h-4 w-24" />
                      <div className="flex items-center gap-2">
                        <StaticShimmer className="h-8 w-8 rounded" />
                        <StaticShimmer className="h-4 w-12" />
                        <StaticShimmer className="h-8 w-8 rounded" />
                      </div>
                    </div>
                    {/* PDF Content Skeleton */}
                    <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-100">
                      <div className="w-full max-w-4xl">
                        <div className="bg-white border shadow-lg rounded">
                          <div className="p-8 space-y-4">
                            {/* PDF Page Skeletons */}
                            {[1, 2, 3].map((page) => (
                              <div key={page} className="bg-gray-50 rounded p-6 space-y-3">
                                <StaticShimmer className="h-6 w-3/4" />
                                <StaticShimmer className="h-4 w-full" />
                                <StaticShimmer className="h-4 w-full" />
                                <StaticShimmer className="h-4 w-5/6" />
                                <div className="pt-4 space-y-2">
                                  <StaticShimmer className="h-5 w-1/3" />
                                  <StaticShimmer className="h-4 w-full" />
                                  <StaticShimmer className="h-4 w-full" />
                                  <StaticShimmer className="h-4 w-4/5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-2 hover:bg-gray-300 transition-colors">
                <div className="w-1 h-full mx-auto bg-gray-200" />
              </PanelResizeHandle>
              <Panel defaultSize={40} minSize={30}>
                <div className="h-full pl-2">
                  {/* Comment Sidebar Skeleton */}
                  <div className="flex flex-col h-full bg-white border-l">
                    <div className="flex-1 overflow-y-auto p-4">
                      {/* Header Skeleton */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <StaticShimmer className="h-5 w-5 rounded" />
                          <StaticShimmer className="h-6 w-32" />
                        </div>
                        <StaticShimmer className="h-8 w-24 rounded-lg" />
                      </div>
                      {/* Comments Skeleton */}
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((comment) => (
                          <div key={comment} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start gap-3 mb-2">
                              <StaticShimmer className="w-8 h-8 rounded-full flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <StaticShimmer className="h-4 w-24" />
                                  <StaticShimmer className="h-3 w-16" />
                                </div>
                                <div className="space-y-2 mt-2">
                                  <StaticShimmer className="h-4 w-full" />
                                  <StaticShimmer className="h-4 w-full" />
                                  <StaticShimmer className="h-4 w-3/4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Comment Form Skeleton */}
                    <div className="border-t p-4 bg-white">
                      <StaticShimmer className="h-4 w-32 mb-3" />
                      <StaticShimmer className="h-24 w-full rounded-lg mb-3" />
                      <StaticShimmer className="h-10 w-full rounded-lg" />
                    </div>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

