// app/dashboard/map/components/DocumentForm.tsx
'use client'

import { useState } from 'react'
import { CategoryDoc } from '@prisma/client'
import { LocationData, DocumentWithCategory } from '@/app/types/document'
import { createDocument } from '@/app/lib/actions/documents/create'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import { 
  XMarkIcon, 
  MapPinIcon, 
  DocumentIcon, 
  PhotoIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  // สร้าง locationData จาก initialData หรือ location
  const locationData = initialData ? {
    lat: initialData.latitude,
    lng: initialData.longitude,
    province: initialData.province,
    amphoe: initialData.amphoe,
    district: initialData.district,
    geocode: 0
  } : location;

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/webp',
      }

      const compressedFile = await imageCompression(file, options)
      const webpFile = new File(
        [compressedFile], 
        `${file.name.split('.')[0]}.webp`, 
        { type: 'image/webp' }
      )
      
      return webpFile
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบีบอัดภาพ:', error)
      toast.error('เกิดข้อผิดพลาดในการบีบอัดภาพ')
      return file
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`ขนาดไฟล์เกิน 100MB`)
      e.target.value = ''
      return
    }

    setSelectedImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const isValidType = validTypes.some(type => 
      file.type.includes(type.replace('.', '')) || file.name.endsWith(type)
    )

    if (!isValidType) {
      toast.error('กรุณาอัพโหลดไฟล์ PDF หรือ Word เท่านั้น')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`ขนาดไฟล์เกิน 100MB`)
      e.target.value = ''
      return
    }

    setSelectedDocumentFile(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInternalIsSubmitting(true)
  
    try {
      const formData = new FormData(e.currentTarget)
      
      // ตรวจสอบค่าปี พ.ศ.
      const yearValue = formData.get('year')?.toString()
      if (yearValue) {
        const year = parseInt(yearValue)
        if (isNaN(year) || year < 2500 || year > 2700) {
          toast.error('กรุณาระบุปี พ.ศ. ที่ถูกต้อง (2500-2700)')
          setInternalIsSubmitting(false)
          return
        }
      }
      
      // ตรวจสอบขนาดไฟล์เอกสาร
      const documentFile = formData.get('document') as File
      if (documentFile && documentFile.size > MAX_FILE_SIZE) {
        toast.error('ขนาดไฟล์เกิน 100MB')
        setInternalIsSubmitting(false)
        return
      }
      
      // ถ้ามีการเลือกไฟล์ภาพใหม่ ทำการบีบอัดก่อน
      if (selectedImageFile) {
        formData.delete('coverImage')
        toast.loading('กำลังประมวลผลรูปภาพ...', { id: 'compressionToast' })
        
        const compressedImageFile = await compressImage(selectedImageFile)
        formData.append('coverImage', compressedImageFile)
        
        toast.dismiss('compressionToast')
      }
      
      // ถ้าเป็นโหมดสร้างใหม่
      if (location && !initialData) {
        formData.append('latitude', location.lat.toString())
        formData.append('longitude', location.lng.toString())
        formData.append('province', location.province)
        formData.append('amphoe', location.amphoe)
        formData.append('district', location.district)
        if (location.zone) {
          formData.append('zone', location.zone)
        }
  
        toast.loading('กำลังบันทึกข้อมูล...', { id: 'uploadToast' })
        
        if (onSubmit) {
          await onSubmit(formData)
        } else {
          await createDocument(formData)
        }
        
        toast.dismiss('uploadToast')
        toast.success('บันทึกข้อมูลสำเร็จ')
        if (onSuccess) await onSuccess()
      } 
      else if (action) {
        toast.loading('กำลังบันทึกข้อมูล...', { id: 'uploadToast' })
        await action(formData)
        toast.dismiss('uploadToast')
      }
      
      if (onClose) onClose()
    } catch (error) {
      toast.dismiss('compressionToast')
      toast.dismiss('uploadToast')
      
      let message = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      
      if (error instanceof Error) {
        if (error.message.includes('NEXT_REDIRECT')) {
          // ไม่ต้องแสดงข้อผิดพลาดสำหรับการ redirect
        } else if (error.message.includes('timeout')) {
          message = 'การอัพโหลดไฟล์ใช้เวลานานเกินไป'
        } else if (error.message.includes('network')) {
          message = 'เกิดปัญหาเครือข่ายระหว่างการอัพโหลด'
        } else {
          message = error.message
        }
      }
      
      if (error && !error.toString().includes('NEXT_REDIRECT')) {
        toast.error(message);
      }
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <DocumentIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {initialData ? 'แก้ไขเอกสาร' : 'เพิ่มเอกสารใหม่'}
              </h1>
              <p className="text-sm text-slate-600">
                กรอกข้อมูลเอกสารให้ครบถ้วน
              </p>
            </div>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Location Info */}
        {locationData && (
          <div className="bg-white rounded-xl border border-slate-200/50 p-4 mb-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <MapPinIcon className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-900">ตำแหน่งที่ตั้ง</span>
            </div>
            <p className="text-sm text-slate-600">
              {locationData.district}, {locationData.amphoe}, {locationData.province}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                ข้อมูลพื้นฐาน
              </h3>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  หมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  required
                  defaultValue={initialData?.categoryId || ""}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ชื่อเอกสาร <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={initialData?.title || ""}
                  placeholder="กรอกชื่อเอกสาร"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  รายละเอียด <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  defaultValue={initialData?.description || ""}
                  rows={4}
                  placeholder="อธิบายเนื้อหาของเอกสาร..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                />
              </div>

              {/* Year and Publish Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ปี พ.ศ.
                  </label>
                  <input
                    type="number"
                    name="year"
                    min="2500"
                    max="2700"
                    defaultValue={initialData?.year || new Date().getFullYear() + 543}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    การเผยแพร่
                  </label>
                  <div className="flex items-center h-10 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPublished"
                        defaultChecked={initialData?.isPublished ?? true}
                        className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                      />
                      <span className="text-sm text-slate-700">เผยแพร่เอกสาร</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                ไฟล์เอกสาร
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Document File */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ไฟล์เอกสาร {!initialData && <span className="text-red-500">*</span>}
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <input 
                      type="file"
                      name="document"
                      required={!initialData}
                      accept=".pdf,.doc,.docx"
                      onChange={handleDocumentChange}
                      className="hidden"
                      id="document-input"
                    />
                    <label htmlFor="document-input" className="cursor-pointer">
                      <DocumentIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <div className="text-sm text-slate-600 mb-1">
                        {selectedDocumentFile ? 'เลือกไฟล์แล้ว' : 'คลิกเพื่อเลือกไฟล์'}
                      </div>
                      <div className="text-xs text-slate-500">
                        PDF, DOC, DOCX (สูงสุด 100MB)
                      </div>
                    </label>
                  </div>
                  
                  {selectedDocumentFile && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-emerald-600">
                      <CheckIcon className="w-4 h-4" />
                      <span>{selectedDocumentFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    รูปปกเอกสาร
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <input 
                      type="file"
                      name="coverImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-input"
                    />
                    <label htmlFor="image-input" className="cursor-pointer">
                      {previewImage ? (
                        <div className="w-20 h-20 mx-auto mb-2 border rounded-lg overflow-hidden">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <PhotoIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      )}
                      <div className="text-sm text-slate-600 mb-1">
                        {previewImage ? 'เปลี่ยนรูปภาพ' : 'คลิกเพื่อเลือกรูป'}
                      </div>
                      <div className="text-xs text-slate-500">
                        JPG, PNG, GIF (จะถูกบีบอัดอัตโนมัติ)
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-slate-50 rounded-lg p-4">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                <InformationCircleIcon className="w-4 h-4" />
                <span>{showHelp ? 'ซ่อน' : 'แสดง'}คำแนะนำ</span>
              </button>
              
              {showHelp && (
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div>
                    <p className="font-medium text-slate-700 mb-1">เกี่ยวกับไฟล์:</p>
                    <ul className="space-y-1 text-xs list-disc list-inside">
                      <li>รูปภาพจะถูกบีบอัดเป็น WebP ขนาดประมาณ 300KB</li>
                      <li>ไฟล์ขนาดใหญ่อาจใช้เวลาอัพโหลดนาน</li>
                      <li>แนะนำให้ใช้ไฟล์ขนาดไม่เกิน 50MB สำหรับประสิทธิภาพที่ดี</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose || (() => window.history.back())}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center ${
                  isSubmitting 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
                    บันทึกเอกสาร
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}