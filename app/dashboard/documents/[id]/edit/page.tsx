import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDocument } from '@/app/lib/actions/documents/get'
import { updateDocument } from '@/app/lib/actions/documents/update'
import { getCategories } from '@/app/lib/actions/categories/get'
import DocumentForm from '@/app/dashboard/map/components/DocumentForm'
import { DocumentWithCategory, LocationData } from '@/app/types/document'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDocumentPage({ params }: PageProps) {
  // รอให้ params พร้อมก่อนใช้งาน (ใช้ await กับ params ที่เป็น Promise ใน Next.js 15)
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
    geocode: 0  // กำหนดค่าเริ่มต้น หรือดึงจากข้อมูลถ้ามี
  }

  // ฟังก์ชันสำหรับอัพเดทเอกสาร (Server Action)
  async function handleUpdateDocument(formData: FormData) {
    'use server'
    
    // เพิ่มข้อมูลตำแหน่งที่จำเป็นลงใน formData
// เพิ่มการตรวจสอบว่า documentData มีค่าก่อนเข้าถึงคุณสมบัติ
    if (documentData) {
      formData.append('district', documentData.district)
      formData.append('amphoe', documentData.amphoe)
      formData.append('province', documentData.province)
      formData.append('latitude', documentData.latitude.toString())
      formData.append('longitude', documentData.longitude.toString())
    }
    
    // อัพเดทเอกสาร
    await updateDocument(id, formData)
    
    // รีวาลิเดทเส้นทางเพื่ออัพเดทแคช
    revalidatePath(`/dashboard/documents`)
    revalidatePath(`/dashboard/documents/${id}`)
    redirect('/dashboard/documents')
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600">
          แดชบอร์ด
        </Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard/documents" className="hover:text-blue-600">
          เอกสาร
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">แก้ไข</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">แก้ไขเอกสาร</h1>
        <Link 
          href="/dashboard/documents"
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700"
        >
          กลับไปรายการเอกสาร
        </Link>
      </div>
      
      <DocumentForm 
        initialData={documentData as unknown as DocumentWithCategory}
        location={locationData}
        categories={categories}
        action={handleUpdateDocument}
      />
    </div>
  )
}