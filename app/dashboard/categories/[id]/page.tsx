// app/dashboard/categories/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategory } from '@/app/lib/actions/categories/get'
import { deleteCategory } from '@/app/lib/actions/categories/delete'
import type { CategoryDoc } from '@prisma/client'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    return { title: 'ไม่พบประเภทเอกสาร' }
  }

  return {
    title: `${category.name} - ประเภทเอกสาร | SDN MapPortal`,
    description: category.description || `รายละเอียดประเภทเอกสาร ${category.name}`
  }
}

interface CategoryWithCount extends CategoryDoc {
    _count: {
      documents: number
    }
  }
  
  export default async function CategoryPage({ params }: PageProps) {
    const { id } = await params
    const category = await getCategory(id) as CategoryWithCount
    
    if (!category) {
      notFound()
    }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-orange-600">
          แดชบอร์ด
        </Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard/categories" className="hover:text-orange-600">
          ประเภทเอกสาร
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category.name}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-600">{category.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/categories/${id}/edit`}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            แก้ไข
          </Link>
          <Link
            href="/dashboard/categories"
            className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ย้อนกลับ
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">จำนวนเอกสาร</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {category._count?.documents || 0}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">วันที่สร้าง</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {new Date(category.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {category._count?.documents > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              รายการเอกสาร
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">
                อยู่ระหว่างการพัฒนา...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}