export function UsersShimmer() {
  return (
    <div className="flex-1 p-8">
      {/* Header Shimmer */}
      <div className="mb-8">
        <div className="h-9 w-32 bg-gray-200 rounded-lg shimmer mb-2" />
        <div className="h-5 w-56 bg-gray-200 rounded-lg shimmer" />
      </div>

      {/* Search Shimmer */}
      <div className="mb-6">
        <div className="h-10 w-full bg-gray-200 rounded-lg shimmer" />
      </div>

      {/* Table Shimmer */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[1, 2, 3, 4].map((i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="h-4 w-48 bg-gray-200 rounded shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-40 bg-gray-200 rounded shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Shimmer */}
      <div className="mt-6">
        <div className="h-5 w-40 bg-gray-200 rounded shimmer" />
      </div>
    </div>
  );
}


