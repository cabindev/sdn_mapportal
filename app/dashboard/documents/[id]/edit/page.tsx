//app/dashboard/documents/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getDocument } from '@/app/lib/actions/documents/get'
import { updateDocument } from '@/app/lib/actions/documents/update'
import { getCategories } from '@/app/lib/actions/categories/get'
import DocumentForm from '@/app/dashboard/map/components/DocumentForm'
import { DocumentWithCategory, LocationData } from '@/app/types/document'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params
  
  // ดึงข้อมูลเอกสารและหมวดหมู่
  const [documentData, categories] = await Promise.all([
    getDocument(id),
    getCategories()
  ])
  
  if (!documentData) {
    notFound()
  }

  // สร้าง location data จาก document
  const locationData: LocationData = {
    lat: documentData.latitude,
    lng: documentData.longitude,
    province: documentData.province,
    amphoe: documentData.amphoe,
    district: documentData.district,
    geocode: 0
  }

  // ฟังก์ชันสำหรับอัพเดทเอกสาร
  async function handleUpdateDocument(formData: FormData) {
    'use server'
    
    if (documentData) {
      formData.append('district', documentData.district)
      formData.append('amphoe', documentData.amphoe)
      formData.append('province', documentData.province)
      formData.append('latitude', documentData.latitude.toString())
      formData.append('longitude', documentData.longitude.toString())
    }
    
    await updateDocument(id, formData)
    
    revalidatePath(`/dashboard/documents`)
    revalidatePath(`/dashboard/documents/${id}`)
    redirect('/dashboard/documents')
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-8">
          <Link 
            href="/dashboard" 
            className="hover:text-slate-900 transition-colors font-medium"
          >
            แดชบอร์ด
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
          <Link 
            href="/dashboard/documents" 
            className="hover:text-slate-900 transition-colors font-medium"
          >
            เอกสาร
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">แก้ไข</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="p-2 bg-slate-100 rounded-lg">
              <PencilIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">แก้ไขเอกสาร</h1>
              <p className="text-sm text-slate-600 mt-1">
                ปรับแต่งข้อมูลและรายละเอียดของเอกสาร
              </p>
            </div>
          </div>
          
          <Link 
            href="/dashboard/documents"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            กลับไปรายการ
          </Link>
        </div>

        {/* Document Info Card */}
        <div className="bg-white rounded-xl border border-slate-200/50 p-6 mb-6 shadow-sm">
          <div className="flex items-start space-x-4">
            {documentData.coverImage && (
              <div className="flex-shrink-0">
                <img
                  src={documentData.coverImage}
                  alt={documentData.title}
                  className="w-16 h-9 object-cover rounded-md border border-slate-200"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {documentData.title}
              </h3>
              {documentData.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {documentData.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">หมวดหมู่:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                    {documentData.category?.name || 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">สถานะ:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    documentData.isPublished 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                  }`}>
                    {documentData.isPublished ? 'เผยแพร่' : 'ไม่เผยแพร่'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 bg-slate-50/30">
            <h2 className="text-lg font-semibold text-slate-900">แก้ไขข้อมูลเอกสาร</h2>
            <p className="text-sm text-slate-600 mt-1">
              กรุณากรอกข้อมูลที่ต้องการเปลี่ยนแปลง
            </p>
          </div>
          
          <div className="p-6">
            <DocumentForm 
              initialData={documentData as unknown as DocumentWithCategory}
              location={locationData}
              categories={categories}
              action={handleUpdateDocument}
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200/50">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">คำแนะนำการแก้ไข</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="space-y-2">
              <p className="font-medium text-slate-700">ข้อมูลพื้นฐาน</p>
              <ul className="space-y-1 text-xs">
                <li>• ชื่อเอกสารควรสั้น กระชับ และอธิบายเนื้อหาได้ชัดเจน</li>
                <li>• คำอธิบายช่วยให้ผู้อ่านเข้าใจเนื้อหาก่อนดาวน์โหลด</li>
                <li>• เลือกหมวดหมู่ที่เหมาะสมเพื่อง่ายต่อการค้นหา</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-slate-700">การเผยแพร่</p>
              <ul className="space-y-1 text-xs">
                <li>• เผยแพร่เมื่อเอกสารพร้อมสำหรับการดูหรือดาวน์โหลด</li>
                <li>• ไม่เผยแพร่หากต้องการแก้ไขเพิ่มเติมก่อน</li>
                <li>• ตรวจสอบความถูกต้องของข้อมูลก่อนเผยแพร่</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}