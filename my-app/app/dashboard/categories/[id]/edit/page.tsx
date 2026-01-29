// app/dashboard/categories/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategory } from '@/app/lib/actions/categories/get'
import { updateCategory } from '@/app/lib/actions/categories/update'
import { CategoryForm } from '@/app/dashboard/components/categories/CategoryForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({
  params
}: PageProps) {
  // รอ params ให้พร้อมก่อนใช้
  const { id } = await params
  const category = await getCategory(id)
  
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
        <Link 
          href={`/dashboard/categories/${id}`}  // ใช้ id ที่ await แล้ว
          className="hover:text-orange-600"
        >
          {category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">แก้ไข</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">แก้ไขประเภทเอกสาร</h1>
      
      <CategoryForm 
        initialData={category}
        action={async (formData: FormData) => {
          'use server'
          await updateCategory(id, formData)  // ใช้ id ที่ await แล้ว
        }}
      />
    </div>
  )
}