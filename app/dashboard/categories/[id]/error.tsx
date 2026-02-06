// app/dashboard/categories/[id]/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-red-600 mb-2">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-red-500 mb-4">
          ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ลองใหม่
          </button>
          <Link
            href="/dashboard/categories"
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    </div>
  )
}