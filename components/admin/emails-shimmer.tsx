export function EmailsShimmer() {
  return (
    <div className="flex-1 p-8">
      {/* Header Shimmer */}
      <div className="mb-8">
        <div className="h-9 w-40 bg-gray-200 rounded-lg shimmer mb-2" />
        <div className="h-5 w-72 bg-gray-200 rounded-lg shimmer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Composer Shimmer - Left Side */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-7 w-32 bg-gray-200 rounded shimmer" />
            <div className="h-9 w-24 bg-gray-200 rounded shimmer" />
          </div>

          <div className="space-y-4">
            {/* Template Selector Shimmer */}
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded shimmer mb-2" />
              <div className="h-10 w-full bg-gray-200 rounded-lg shimmer" />
            </div>

            {/* Subject Shimmer */}
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-2" />
              <div className="h-10 w-full bg-gray-200 rounded-lg shimmer" />
            </div>

            {/* Content Editor Shimmer */}
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded shimmer mb-2" />
              <div className="border border-gray-300 rounded-lg">
                <div className="h-10 bg-gray-50 border-b border-gray-200 rounded-t-lg" />
                <div className="h-96 bg-white rounded-b-lg p-4 space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded shimmer" />
                  <div className="h-4 w-full bg-gray-200 rounded shimmer" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded shimmer" />
                  <div className="h-4 w-full bg-gray-200 rounded shimmer" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users List Shimmer - Right Side */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <div className="h-7 w-32 bg-gray-200 rounded shimmer mb-4" />
            <div className="h-10 w-full bg-gray-200 rounded-lg shimmer mb-3" />
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-gray-200 rounded shimmer" />
              <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
              >
                <div className="w-4 h-4 bg-gray-200 rounded shimmer" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-gray-200 rounded shimmer mb-1" />
                  <div className="h-3 w-28 bg-gray-200 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


