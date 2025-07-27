// app/dashboard/components/categories/CategoryList.tsx
'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { deleteCategory } from '@/app/lib/actions/categories/delete'
import CategoryCard from './CategoryCard'
import type { CategoryDoc } from '@prisma/client'

interface CategoryListProps {
  categories: (CategoryDoc & {
    _count: { documents: number }
  })[]
}

export default function CategoryList({ categories }: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบประเภทเอกสาร?')) return
    
    setDeletingId(id)
    try {
      await deleteCategory(id)
      toast.success('ลบประเภทเอกสารสำเร็จ')
    } catch (error) {
      toast.error('ไม่สามารถลบประเภทเอกสารได้')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* แสดงเป็นตารางบนหน้าจอขนาดใหญ่ */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">คำอธิบาย</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">จำนวนเอกสาร</th>
              <th scope="col" className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-500 truncate max-w-xs">{category.description || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs text-gray-500">{category._count.documents}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                  <div className="flex justify-end space-x-2">
                    <a 
                      href={`/dashboard/categories/${category.id}/edit`}
                      className="text-orange-600 hover:text-orange-900 px-2 py-1 rounded hover:bg-orange-50 text-xs"
                    >
                      แก้ไข
                    </a>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingId === category.id || category._count.documents > 0}
                      className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      {deletingId === category.id ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* แสดงเป็นการ์ดบนมือถือ */}
      <div className="md:hidden space-y-4">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id}
            category={category}
            onDelete={() => handleDelete(category.id)}
            isDeleting={deletingId === category.id}
          />
        ))}
      </div>
    </div>
  )
}