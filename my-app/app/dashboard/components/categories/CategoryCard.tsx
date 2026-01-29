// app/dashboard/components/categories/CategoryCard.tsx
import Link from 'next/link'
import type { CategoryDoc } from '@prisma/client'

interface CategoryCardProps {
  category: CategoryDoc & {
    _count: { documents: number }
  }
  onDelete: () => void
  isDeleting: boolean
}

export default function CategoryCard({ 
  category, 
  onDelete,
  isDeleting 
}: CategoryCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <Link 
            href={`/dashboard/categories/${category.id}`}
            className="text-lg font-medium text-gray-900 hover:text-orange-600"
          >
            {category.name}
          </Link>
          {category.description && (
            <p className="text-gray-600 text-sm mt-1">{category.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            จำนวนเอกสาร: {category._count.documents}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/categories/${category.id}/edit`}
            className="px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded"
          >
            แก้ไข
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting || category._count.documents > 0}
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'กำลังลบ...' : 'ลบ'}
          </button>
        </div>
      </div>
    </div>
  )
}