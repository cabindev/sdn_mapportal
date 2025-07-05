export default function Loading() {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse mr-3"></div>
          <div className="h-8 w-72 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
  
        <div className="h-16 mb-8 bg-gray-200 rounded-lg animate-pulse"></div>
  
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="h-6 w-52 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Array(5).fill(0).map((_, i) => (
                    <th key={i} scope="col" className="px-6 py-3 text-left">
                      <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-5 w-full bg-gray-200 rounded-md animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }