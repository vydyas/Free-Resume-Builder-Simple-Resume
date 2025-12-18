export function DashboardShimmer() {
  return (
    <div className="flex-1 p-8">
      {/* Header Shimmer */}
      <div className="mb-8">
        <div className="h-9 w-48 bg-gray-200 rounded-lg shimmer mb-2" />
        <div className="h-5 w-64 bg-gray-200 rounded-lg shimmer" />
      </div>

      {/* Stats Cards Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg shimmer" />
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users Shimmer */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-7 w-32 bg-gray-200 rounded shimmer mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded shimmer mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


