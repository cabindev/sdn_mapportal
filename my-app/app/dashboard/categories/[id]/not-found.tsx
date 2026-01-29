// app/dashboard/categories/[id]/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-yellow-600 mb-2">
          ไม่พบข้อมูล
        </h2>
        <p className="text-yellow-600 mb-4">
          ไม่พบประเภทเอกสารที่คุณต้องการ
        </p>
        <Link
          href="/dashboard/categories"
          className="px-4 py-2 border border-yellow-200 text-yellow-600 rounded-lg hover:bg-yellow-50"
        >
          กลับไปหน้ารายการ
        </Link>
      </div>
    </div>
  )
}