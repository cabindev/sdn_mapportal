// app/dashboard/categories/new/loading.tsx
export default function Loading() {
  return (
    <div className="p-6">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}