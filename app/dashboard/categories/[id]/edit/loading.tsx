// app/dashboard/categories/[id]/edit/loading.tsx
export default function Loading() {
  return (
    <div className="p-6">
      <div className="animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
        <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
        <div className="bg-white p-6 rounded-lg">
          <div className="space-y-4">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
 }