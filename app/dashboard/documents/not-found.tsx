// app/dashboard/documents/[id]/not-found.tsx
import Link from 'next/link'


export default function NotFound() {
  return (
    <div className="container mx-auto py-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">ไม่พบเอกสาร</h2>
        <p className="text-gray-600 mb-4">
          ไม่พบเอกสารที่คุณต้องการแก้ไข กรุณาตรวจสอบ URL อีกครั้ง
        </p>
        <Link
          href="/dashboard/documents"
          className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          กลับไปหน้ารายการเอกสาร
        </Link>
      </div>
    </div>
  );
}
