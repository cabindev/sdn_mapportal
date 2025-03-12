// app/dashboard/map/components/DocumentForm.tsx
'use client'

import { useState } from 'react'
import { CategoryDoc } from '@prisma/client'
import { LocationData, DocumentWithCategory } from '@/app/types/document'
import { createDocument } from '@/app/lib/actions/documents/create'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface DocumentFormProps {
  categories: CategoryDoc[];
  location?: LocationData;
  initialData?: DocumentWithCategory | null;
  onClose?: () => void;
  onSuccess?: () => Promise<void>;
  action?: (formData: FormData) => Promise<void>;
  onSubmit?: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function DocumentForm({ 
  categories, 
  location,
  initialData,
  onClose,
  onSuccess,
  action,
  onSubmit,
  isSubmitting: externalIsSubmitting
}: DocumentFormProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;
  
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.coverImage || null)

  // สร้าง locationData จาก initialData หรือ location
  const locationData = initialData ? {
    lat: initialData.latitude,
    lng: initialData.longitude,
    province: initialData.province,
    amphoe: initialData.amphoe,
    district: initialData.district,
    geocode: 0 // หรือค่าที่เหมาะสม
  } : location;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInternalIsSubmitting(true)
  
    try {
      const formData = new FormData(e.currentTarget)
      
      // ถ้าเป็นโหมดสร้างใหม่
      if (location && !initialData) {
        formData.append('latitude', location.lat.toString())
        formData.append('longitude', location.lng.toString())
        formData.append('province', location.province)
        formData.append('amphoe', location.amphoe)
        formData.append('district', location.district)
        // เพิ่มค่า zone
        if (location.zone) {
          formData.append('zone', location.zone)
        }
  
        if (onSubmit) {
          await onSubmit(formData)
        } else {
          await createDocument(formData)
        }
        
        toast.success('บันทึกข้อมูลสำเร็จ')
        if (onSuccess) await onSuccess()
      } 
      // ถ้าเป็นโหมด edit
      else if (action) {
        await action(formData)
      }
      
      if (onClose) onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      toast.error(message)
    } finally {
      setInternalIsSubmitting(false)
    }
  }
  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'แก้ไขข้อมูลเอกสาร' : 'เพิ่มข้อมูลเอกสาร'}
        </h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ข้อมูลตำแหน่ง */}
        {locationData && (
  <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
    <h3 className="font-medium mb-3 text-orange-800 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      ข้อมูลตำแหน่ง
    </h3>
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

        {/* หมวดหมู่ */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            หมวดหมู่ <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            required
            defaultValue={initialData?.categoryId || ""}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* ชื่อเอกสาร */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            ชื่อเอกสาร <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={initialData?.title || ""}
            placeholder="กรอกชื่อเอกสาร"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        {/* รายละเอียด */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            รายละเอียด <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            defaultValue={initialData?.description || ""}
            rows={4}
            placeholder="กรอกรายละเอียดเอกสาร"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        {/* ไฟล์เอกสาร */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            ไฟล์เอกสาร {!initialData && <span className="text-red-500">*</span>}
          </label>
          
          {/* อัพโหลดไฟล์ใหม่ */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-700"><span className="font-medium">คลิกเพื่ออัพโหลดเอกสาร</span></p>
                <p className="text-xs text-gray-500">PDF หรือ Word (สูงสุด 10MB)</p>
              </div>
              <input 
                type="file"
                name="document"
                id="document"
                required={!initialData}
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    // อัพเดท UI เพื่อแสดงชื่อไฟล์ที่เลือก
                    const fileNameElement = document.getElementById('selected-document-name');
                    if (fileNameElement) {
                      fileNameElement.textContent = e.target.files[0].name;
                      document.getElementById('selected-document-container')?.classList.remove('hidden');
                    }
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
          
          {/* แสดงชื่อไฟล์ที่เลือกในครั้งปัจจุบัน */}
          <div id="selected-document-container" className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center hidden">
            <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-700">ไฟล์ที่เลือก: </span>
            <span id="selected-document-name" className="text-sm font-medium text-orange-600 ml-1"></span>
          </div>
          
          {/* แสดงไฟล์เดิม (กรณีแก้ไข) */}
          {initialData?.filePath && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center">
              <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-700">ไฟล์ปัจจุบัน: </span>
              <span className="text-sm font-medium text-orange-600 ml-1">{initialData.filePath.split('/').pop()}</span>
            </div>
          )}
        </div>

        {/* รูปปก */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">รูปปก</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-700"><span className="font-medium">คลิกเพื่ออัพโหลดรูปภาพ</span></p>
                  <p className="text-xs text-gray-500">JPG, PNG หรือ WEBP (สูงสุด 5MB)</p>
                </div>
                <input 
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className={`${previewImage ? 'border rounded-lg overflow-hidden flex items-center justify-center' : 'hidden'}`}>
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="object-cover h-full w-full"
                />
              )}
            </div>
          </div>
        </div>

        {/* การเผยแพร่ */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={initialData?.isPublished ?? true}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            />
            <div>
              <span className="font-medium text-gray-800">เผยแพร่เอกสาร</span>
              <p className="text-sm text-gray-600 mt-1">
                เอกสารที่เผยแพร่จะแสดงบนแผนที่และสามารถค้นหาได้
              </p>
            </div>
          </label>
        </div>

        {/* ปุ่มดำเนินการ */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose || (() => window.history.back())}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className={`px-5 py-2.5 text-white rounded-lg transition-colors flex items-center justify-center ${
              isSubmitting 
                ? "bg-orange-400 cursor-not-allowed" 
                : "bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                บันทึก
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}