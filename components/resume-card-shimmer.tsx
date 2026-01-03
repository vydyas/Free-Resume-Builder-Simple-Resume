import React from "react";

export function ResumeCardShimmer() {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-5 blur-sm animate-pulse h-[180px] flex flex-col">
      {/* Icon and Color Scheme */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse flex-shrink-0"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Resume Name */}
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4 animate-pulse"></div>

      {/* Updated Date */}
      <div className="h-3 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}



