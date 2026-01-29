// app/dashboard/categories/new/page.tsx
import { CategoryForm } from "../../components/categories/CategoryForm"
import { createCategory } from "@/app/lib/actions/categories/create"

export default function NewCategoryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">เพิ่มประเภทเอกสารใหม่</h1>
      <CategoryForm 
        initialData={null} 
        action={createCategory}   // ส่ง action เข้าไป
      />
    </div>
  )
}