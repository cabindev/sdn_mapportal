// app/dashboard/documents/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
  }, [error]);

  return (
    <div className="container mx-auto py-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}