export function AdminListShimmer() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="h-7 w-40 bg-gray-200 rounded-lg shimmer mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded-lg shimmer" />
      </div>

      {/* Filters row */}
      <div className="mb-4 bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex flex-wrap gap-3">
        <div className="h-9 w-full sm:flex-1 bg-gray-200 rounded shimmer" />
        <div className="h-9 w-32 bg-gray-200 rounded shimmer" />
        <div className="h-9 w-32 bg-gray-200 rounded shimmer" />
      </div>

      {/* Table/list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 h-10 bg-gray-50" />
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-start">
              <div className="w-32 h-4 bg-gray-200 rounded shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded shimmer" />
                <div className="h-3 w-3/4 bg-gray-200 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
