// app/dashboard/categories/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline'
import { getCategories } from '@/app/lib/actions/categories/get'
import CategoryList from '../components/categories/CategoryList'

export const metadata: Metadata = {
  title: 'ประเภทเอกสาร | SDN MapPortal',
  description: 'จัดการประเภทเอกสารในระบบ'
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="p-3 bg-slate-100 rounded-xl mr-4">
              <FolderIcon className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-slate-900">ประเภทเอกสาร</h1>
              <p className="text-xs text-slate-600 mt-1">
                จัดการและควบคุมประเภทของเอกสารในระบบ
              </p>
            </div>
          </div>
          
          <Link
            href="/dashboard/categories/new"
            className="inline-flex items-center px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            เพิ่มประเภทใหม่
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-slate-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs text-slate-600">ประเภททั้งหมด</p>
                <p className="text-xl font-semibold text-slate-900">{categories.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs text-slate-600">ประเภทที่ใช้งาน</p>
                <p className="text-xl font-semibold text-emerald-600">
                  {categories.filter(cat => cat._count?.documents && cat._count.documents > 0).length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs text-slate-600">ประเภทว่าง</p>
                <p className="text-xl font-semibold text-amber-600">
                  {categories.filter(cat => !cat._count?.documents || cat._count.documents === 0).length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category List */}
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
          {categories.length > 0 ? (
            <CategoryList categories={categories} />
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FolderIcon className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-2">
                ยังไม่มีประเภทเอกสาร
              </h3>
              <p className="text-xs text-slate-600 mb-6 max-w-md mx-auto">
                เริ่มต้นโดยการสร้างประเภทเอกสารแรกเพื่อจัดหมวดหมู่เอกสารในระบบ
              </p>
              <Link
                href="/dashboard/categories/new"
                className="inline-flex items-center px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                เพิ่มประเภทแรก
              </Link>
            </div>
          )}
        </div>

        {/* Help Section */}
        {categories.length > 0 && (
          <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200/50">
            <h3 className="text-xs font-semibold text-slate-900 mb-3">คำแนะนำการจัดการประเภทเอกสาร</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
              <div>
                <p className="font-medium text-slate-700 mb-2 text-xs">การตั้งชื่อประเภท:</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>ใช้ชื่อที่สั้น กระชับ และเข้าใจง่าย</li>
                  <li>หลีกเลี่ยงการใช้คำซ้ำกับประเภทที่มีอยู่</li>
                  <li>ควรจัดกลุ่มตามลักษณะงานหรือหน่วยงาน</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-2 text-xs">การจัดการ:</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>สามารถแก้ไขชื่อและรายละเอียดได้ตลอดเวลา</li>
                  <li>การลบประเภทจะส่งผลต่อเอกสารที่เกี่ยวข้อง</li>
                  <li>ควรตรวจสอบจำนวนเอกสารก่อนลบประเภท</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}