// app/dashboard/components/categories/CategoryForm.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  FolderIcon, 
  CheckIcon, 
  XMarkIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline'
import type { CategoryDoc } from '@prisma/client'

interface CategoryFormProps {
  initialData: CategoryDoc | null
  action: (formData: FormData) => Promise<void>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center px-4 py-2 text-sm font-light text-white rounded-lg transition-colors shadow-sm ${
        pending 
          ? 'bg-slate-400 cursor-not-allowed' 
          : 'bg-slate-900 hover:bg-slate-800'
      }`}
    >
      {pending ? (
        <>
          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังบันทึก...
        </>
      ) : (
        <>
          <CheckIcon className="w-4 h-4 mr-2" />
          บันทึก
        </>
      )}
    </button>
  )
}

export function CategoryForm({ initialData, action }: CategoryFormProps) {
  const router = useRouter()
  const [showHelp, setShowHelp] = useState(false)

  const handleFormAction = async (formData: FormData) => {
    try {
      await action(formData)
      toast.success(initialData ? 'แก้ไขประเภทเอกสารสำเร็จ' : 'เพิ่มประเภทเอกสารสำเร็จ')
      router.push('/dashboard/categories')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="p-3 bg-slate-100 rounded-xl mr-4">
            <FolderIcon className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-slate-900">
              {initialData ? 'แก้ไขประเภทเอกสาร' : 'เพิ่มประเภทเอกสารใหม่'}
            </h1>
            <p className="text-sm font-light text-slate-600 mt-1">
              กรอกข้อมูลประเภทเอกสารให้ครบถ้วน
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 bg-slate-50/30">
            <h2 className="text-lg font-light text-slate-900">ข้อมูลประเภทเอกสาร</h2>
          </div>
          
          <form action={handleFormAction} className="p-6 space-y-6">
            
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ชื่อประเภท <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialData?.name}
                required
                placeholder="เช่น รายงานประจำปี, แผนงาน, นโยบาย"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors font-light"
              />
              <p className="mt-1 text-xs font-light text-slate-500">
                ชื่อประเภทจะใช้สำหรับจัดหมวดหมู่เอกสารในระบบ
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                รายละเอียด
              </label>
              <textarea
                name="description"
                defaultValue={initialData?.description || ''}
                rows={4}
                placeholder="อธิบายรายละเอียดของประเภทเอกสารนี้..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors font-light"
              />
              <p className="mt-1 text-xs font-light text-slate-500">
                รายละเอียดจะช่วยให้ผู้ใช้เข้าใจประเภทเอกสารนี้มากขึ้น
              </p>
            </div>

            {/* Help Section */}
            <div className="bg-slate-50 rounded-lg p-4">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center text-sm font-light text-slate-600 hover:text-slate-900 transition-colors"
              >
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                <span>{showHelp ? 'ซ่อน' : 'แสดง'}คำแนะนำ</span>
              </button>
              
              {showHelp && (
                <div className="mt-3 space-y-2 text-sm font-light text-slate-600">
                  <div>
                    <p className="font-medium text-slate-700 mb-1">ตัวอย่างการตั้งชื่อประเภท:</p>
                    <ul className="space-y-1 text-xs list-disc list-inside">
                      <li><strong>รายงานประจำปี</strong> - สำหรับรายงานผลการดำเนินงานประจำปี</li>
                      <li><strong>แผนงาน/โครงการ</strong> - สำหรับเอกสารแผนงานและโครงการต่างๆ</li>
                      <li><strong>นโยบาย/คำสั่ง</strong> - สำหรับเอกสารนโยบายและคำสั่งราชการ</li>
                      <li><strong>คู่มือ/แนวทาง</strong> - สำหรับคู่มือการปฏิบัติงานและแนวทางต่างๆ</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-light text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                ยกเลิก
              </button>
              <div className="flex-1">
                <SubmitButton />
              </div>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        {initialData && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-900 mb-3">ข้อมูลเพิ่มเติม</h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-light">
              <div>
                <span className="text-slate-500">สร้างเมื่อ:</span>
                <span className="ml-2 text-slate-900">
                  {new Date(initialData.createdAt).toLocaleDateString('th-TH')}
                </span>
              </div>
              <div>
                <span className="text-slate-500">แก้ไขล่าสุด:</span>
                <span className="ml-2 text-slate-900">
                  {new Date(initialData.updatedAt).toLocaleDateString('th-TH')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}