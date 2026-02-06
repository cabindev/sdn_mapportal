// app/dashboard/documents/new/page.tsx 
'use client'

import { useState, useEffect } from 'react'
import DocumentForm from '../../map/components/DocumentForm'
import { createDocument } from '@/app/lib/actions/documents/create'
import TambonSearch from '../../map/components/TambonSearch'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { LocationData } from '@/app/types/document'
import { getCategories } from '@/app/lib/actions/categories/get'
import { CategoryDoc } from '@prisma/client'

export default function NewDocumentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const router = useRouter()

  // โหลดข้อมูลหมวดหมู่
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้')
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    loadCategories()
  }, [])

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      // ตรวจสอบว่ามีข้อมูลตำแหน่งหรือไม่
      if (!locationData) {
        throw new Error('กรุณาระบุตำแหน่งที่ตั้ง')
      }

      // เพิ่มข้อมูลตำแหน่งลงใน FormData
      formData.append('latitude', locationData.lat.toString())
      formData.append('longitude', locationData.lng.toString())
      formData.append('province', locationData.province)
      formData.append('amphoe', locationData.amphoe)
      formData.append('district', locationData.district)
      if (locationData.zone) {
        formData.append('zone', locationData.zone)
      }

      await createDocument(formData)
      toast.success('เพิ่มเอกสารสำเร็จ')
      router.refresh()
      router.push('/dashboard/documents')
    } catch (error) {
      console.error('Error creating document:', error)
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มเอกสาร')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">เพิ่มเอกสารใหม่</h1>
      
      {/* ส่วนการค้นหาและเลือกตำแหน่ง */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">1. ระบุตำแหน่งที่ตั้ง</h2>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">ค้นหาตำแหน่งด้วยชื่อตำบล อำเภอ หรือจังหวัด</p>
          <TambonSearch onSelectLocation={handleLocationSelect} />
        </div>
        
        {/* แสดงข้อมูลตำแหน่งเมื่อมีการเลือก */}
        {locationData && (
          <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
            <h3 className="font-medium mb-2 text-orange-800">ข้อมูลตำแหน่งที่เลือก</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-white p-2 rounded-md border border-orange-100">
                <label className="text-sm text-gray-600 font-medium">Latitude</label>
                <div className="text-sm font-medium text-gray-800">{locationData.lat.toFixed(6)}</div>
              </div>
              <div className="bg-white p-2 rounded-md border border-orange-100">
                <label className="text-sm text-gray-600 font-medium">Longitude</label>
                <div className="text-sm font-medium text-gray-800">{locationData.lng.toFixed(6)}</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-md border border-orange-100 space-y-2">
              <div className="flex">
                <span className="text-sm font-medium text-gray-700 w-20">จังหวัด:</span> 
                <span className="text-sm text-gray-800">{locationData.province}</span>
              </div>
              <div className="flex">
                <span className="text-sm font-medium text-gray-700 w-20">อำเภอ:</span> 
                <span className="text-sm text-gray-800">{locationData.amphoe}</span>
              </div>
              <div className="flex">
                <span className="text-sm font-medium text-gray-700 w-20">ตำบล:</span> 
                <span className="text-sm text-gray-800">{locationData.district}</span>
              </div>
              {locationData.zone && (
                <div className="flex">
                  <span className="text-sm font-medium text-gray-700 w-20">ภูมิภาค:</span> 
                  <span className="text-sm text-gray-800 bg-orange-50 px-2 py-0.5 rounded">{locationData.zone}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!locationData && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-700">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              กรุณาค้นหาและเลือกตำแหน่งที่ตั้งก่อนกรอกข้อมูลเอกสาร
            </p>
          </div>
        )}
      </div>
      
      {/* แสดงฟอร์มเอกสารเมื่อมีการเลือกตำแหน่งแล้ว */}
      {locationData && (
        <div>
          <h2 className="text-lg font-semibold mb-4">2. กรอกข้อมูลเอกสาร</h2>
          {isLoadingCategories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p>กำลังโหลดข้อมูลหมวดหมู่...</p>
            </div>
          ) : (
            <DocumentForm 
              categories={categories}
              location={locationData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialData={null}
            />
          )}
        </div>
      )}
      
      {/* ถ้ายังไม่ได้เลือกตำแหน่ง ให้แสดงปุ่ม "เริ่มกรอกข้อมูล" แบบ disabled */}
      {!locationData && (
        <div className="mt-8 text-center">
          <button 
            disabled 
            className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
          >
            เริ่มกรอกข้อมูลเอกสาร (กรุณาเลือกตำแหน่งก่อน)
          </button>
        </div>
      )}
    </div>
  )
}