import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export function ResumeBuilderShimmer() {
  return (
    <div className="flex-1 overflow-hidden blur-sm animate-pulse mt-16 h-[calc(100vh-4rem)]">
      {/* Desktop Layout Shimmer */}
      <div className="hidden lg:flex h-full overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={60} minSize={50} className="h-full">
            <div className="flex justify-center flex-col items-center h-full bg-gray-50 p-8 overflow-auto">
              {/* Resume Shimmer */}
              <div className="w-[220mm] bg-white p-8 rounded-lg shadow-lg min-h-[297mm]">
                {/* Header shimmer */}
                <div className="flex flex-col items-center space-y-4 mb-8 animate-pulse">
                  <div className="h-10 w-64 bg-gray-300 rounded-md"></div>
                  <div className="h-5 w-48 bg-gray-300 rounded-md"></div>
                  <div className="flex gap-2">
                    <div className="h-4 w-32 bg-gray-300 rounded-md"></div>
                    <div className="h-4 w-32 bg-gray-300 rounded-md"></div>
                  </div>
                </div>

                {/* Content sections shimmer */}
                <div className="space-y-8">
                  {[1, 2, 3, 4].map((section) => (
                    <div key={section} className="space-y-3 animate-pulse">
                      <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
                      <div className="space-y-2 ml-2">
                        <div className="h-4 w-full bg-gray-300 rounded-md"></div>
                        <div className="h-4 w-full bg-gray-300 rounded-md"></div>
                        <div className="h-4 w-3/4 bg-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className="w-2 bg-gray-200">
            <div className="w-1 h-full mx-auto bg-gray-300" />
          </PanelResizeHandle>
          <Panel defaultSize={40} minSize={30} className="h-full">
            {/* Sidebar Shimmer */}
            <div className="h-full bg-white shadow-md overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="h-6 w-32 bg-gray-300 rounded mb-4 animate-pulse"></div>
                <div className="h-10 w-full bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Section items shimmer */}
                {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                  <div key={item} className="space-y-3 animate-pulse">
                    <div className="h-5 w-24 bg-gray-300 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-9 w-full bg-gray-300 rounded"></div>
                      <div className="h-9 w-full bg-gray-300 rounded"></div>
                      <div className="h-20 w-full bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Mobile Layout Shimmer */}
      <div className="lg:hidden flex flex-col h-full overflow-hidden">
        {/* Mobile Header Shimmer */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-9 w-28 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Mobile Form Shimmer */}
        <div className="flex-1 overflow-hidden bg-background">
          <div className="p-4 space-y-4">
            {/* Mobile tabs shimmer */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((tab) => (
                <div key={tab} className="h-9 w-24 bg-gray-300 rounded-lg flex-shrink-0 animate-pulse"></div>
              ))}
            </div>

            {/* Form fields shimmer */}
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="space-y-3 animate-pulse">
                <div className="h-5 w-24 bg-gray-300 rounded"></div>
                <div className="space-y-2">
                  <div className="h-10 w-full bg-gray-300 rounded"></div>
                  <div className="h-10 w-full bg-gray-300 rounded"></div>
                  <div className="h-20 w-full bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



