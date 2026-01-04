"use client";

import React from "react";

export function ResumeBuilderShimmer() {

  return (
    <div className="flex-1 overflow-hidden animate-pulse mt-16 h-[calc(100vh-4rem)] p-4">
      {/* Desktop Layout Shimmer */}
      <div className="hidden lg:flex h-full overflow-hidden gap-4">
        {/* Sidebar Shimmer - 20% (Left) */}
        <div className="w-[20%] h-full">
          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Resume Name Header Shimmer */}
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-5 flex-1 bg-gray-300 rounded"></div>
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {/* Section items shimmer */}
              {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                <div key={item} className="flex items-center gap-2 animate-pulse">
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                  <div className="h-10 flex-1 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-center">
                <div className="h-10 w-40 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Preview Shimmer - 60% (Middle) */}
        <div className="flex-1 h-full">
          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Controls Bar Shimmer */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0 animate-pulse">
              {/* Zoom Controls Shimmer - Left */}
              <div className="bg-gray-100 rounded-[24px] px-4 py-1 flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
              </div>
              {/* Download Button Shimmer - Right */}
              <div className="h-10 w-40 bg-gray-300 rounded-lg"></div>
            </div>

            {/* Resume Preview Shimmer - Below Controls */}
            <div className="flex-1 flex justify-center flex-col items-center overflow-auto bg-gray-50 p-8">
              <div className="w-[220mm] bg-white p-8 rounded-lg shadow-lg" style={{ minHeight: '297mm' }}>
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
          </div>
        </div>

        {/* Settings Panel Shimmer - 20% (Right Side) */}
        <div className="w-[20%] h-full flex-shrink-0">
          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
              <div className="h-5 w-24 bg-gray-300 rounded"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-8 w-8 bg-gray-300 rounded"></div>
                ))}
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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



