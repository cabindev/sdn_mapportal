// app/dashboard/map/components/DocumentForm.tsx
'use client'

import { useState } from 'react'
import { CategoryDoc } from '@prisma/client'
import { LocationData, DocumentWithCategory } from '@/app/types/document'
import { createDocument } from '@/app/lib/actions/documents/create'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

// ค่าคงที่สำหรับจำกัดขนาดไฟล์
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

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
  const [documentFileSize, setDocumentFileSize] = useState<string | null>(null)
  const [isLargeDocument, setIsLargeDocument] = useState(false)

  // สร้าง locationData จาก initialData หรือ location
  const locationData = initialData ? {
    lat: initialData.latitude,
    lng: initialData.longitude,
    province: initialData.province,
    amphoe: initialData.amphoe,
    district: initialData.district,
    geocode: 0 // หรือค่าที่เหมาะสม
  } : location;

  const compressImage = async (file: File): Promise<File> => {
    try {
      // ตั้งค่าการบีบอัดภาพ
      const options = {
        maxSizeMB: 0.5, // ขนาดสูงสุดหลังบีบอัด (0.5MB)
        maxWidthOrHeight: 1024, // ความกว้างหรือความสูงสูงสุด (1024px)
        useWebWorker: true, // ใช้ Web Worker เพื่อไม่ให้กระทบกับ main thread
        fileType: 'image/webp', // แปลงเป็นรูปแบบ WebP ซึ่งมีขนาดเล็กกว่า
      }

      // บีบอัดภาพ
      const compressedFile = await imageCompression(file, options)
      
      // สร้างไฟล์ใหม่ด้วยนามสกุล .webp
      const webpFile = new File(
        [compressedFile], 
        `${file.name.split('.')[0]}.webp`, 
        { type: 'image/webp' }
      )
      
      console.log(`ขนาดไฟล์ต้นฉบับ: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
      console.log(`ขนาดไฟล์หลังบีบอัด: ${(webpFile.size / 1024 / 1024).toFixed(2)} MB`)
      
      return webpFile
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบีบอัดภาพ:', error)
      toast.error('เกิดข้อผิดพลาดในการบีบอัดภาพ กรุณาลองใหม่อีกครั้ง')
      // หากมีข้อผิดพลาด ให้ใช้ไฟล์ต้นฉบับ
      return file
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ตรวจสอบว่าเป็นไฟล์ภาพหรือไม่
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น')
      e.target.value = ''
      return
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`ขนาดไฟล์เกิน 100MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า`)
      e.target.value = ''
      return
    }

    // เก็บไฟล์ที่เลือกไว้เพื่อใช้ในการบีบอัดภายหลัง
    setSelectedImageFile(file)

    // สร้าง preview สำหรับแสดงในฟอร์ม
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ตรวจสอบประเภทไฟล์
    const validTypes = ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const isValidType = validTypes.some(type => 
      file.type.includes(type.replace('.', '')) || file.name.endsWith(type)
    )

    if (!isValidType) {
      toast.error('กรุณาอัพโหลดไฟล์ PDF หรือ Word เท่านั้น')
      e.target.value = ''
      return
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`ขนาดไฟล์เกิน 100MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า`)
      e.target.value = ''
      return
    }

    // เก็บข้อมูลไฟล์
    setSelectedDocumentFile(file)
    
    // คำนวณและแสดงขนาดไฟล์
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    setDocumentFileSize(fileSizeMB)
    
    // เช็คขนาดไฟล์ใหญ่ (>80MB) เพื่อใช้กำหนดสีแสดงผล
    setIsLargeDocument(file.size > 80 * 1024 * 1024)

    // อัพเดท UI เพื่อแสดงชื่อไฟล์ที่เลือก
    const fileNameElement = document.getElementById('selected-document-name')
    const fileSizeElement = document.getElementById('selected-document-size')
    
    if (fileNameElement) {
      fileNameElement.textContent = file.name
      document.getElementById('selected-document-container')?.classList.remove('hidden')
    }
    
    if (fileSizeElement) {
      fileSizeElement.textContent = `${fileSizeMB} MB`
      
      // กำหนดสีตามขนาดไฟล์
      if (file.size > 80 * 1024 * 1024) {
        fileSizeElement.className = 'text-sm font-medium text-orange-600 ml-1'
      } else {
        fileSizeElement.className = 'text-sm font-medium text-gray-600 ml-1'
      }
    }
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
        toast.error('ขนาดไฟล์เกิน 100MB กรุณาเลือกไฟล์ขนาดเล็กกว่านี้')
        setInternalIsSubmitting(false)
        return
      }
      
      // ตรวจสอบขนาดรูปภาพ (ถ้ามีการเลือกใหม่)
      if (selectedImageFile && selectedImageFile.size > MAX_FILE_SIZE) {
        toast.error('ขนาดไฟล์รูปภาพเกิน 100MB กรุณาเลือกรูปที่มีขนาดเล็กกว่า')
        setInternalIsSubmitting(false)
        return
      }
      
      // ถ้ามีการเลือกไฟล์ภาพใหม่ ทำการบีบอัดก่อนแนบไปกับ FormData
      if (selectedImageFile) {
        // ลบ coverImage เดิมที่อยู่ใน formData (ที่ถูกเพิ่มโดย form browser)
        formData.delete('coverImage')
        
        // แสดงสถานะกำลังบีบอัด
        toast.loading('กำลังบีบอัดรูปภาพ...', { id: 'compressionToast' })
        
        // บีบอัดภาพและเพิ่มลงใน formData
        const compressedImageFile = await compressImage(selectedImageFile)
        formData.append('coverImage', compressedImageFile)
        
        // แสดงข้อความแจ้งเตือนสำเร็จ
        toast.dismiss('compressionToast')
        toast.success(`บีบอัดภาพสำเร็จ: ${(compressedImageFile.size / 1024 / 1024).toFixed(2)} MB`)
      }
      
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
  
        // แสดงสถานะกำลังอัพโหลด
        toast.loading('กำลังอัพโหลดไฟล์และบันทึกข้อมูล...', { id: 'uploadToast' })
        
        if (onSubmit) {
          await onSubmit(formData)
        } else {
          await createDocument(formData)
        }
        
        toast.dismiss('uploadToast')
        toast.success('บันทึกข้อมูลสำเร็จ')
        if (onSuccess) await onSuccess()
      } 
      // ถ้าเป็นโหมด edit
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
        // ข้อความแสดงข้อผิดพลาดที่เฉพาะเจาะจงยิ่งขึ้น
        if (error.message.includes('NEXT_REDIRECT')) {
          // ไม่ต้องแสดงข้อผิดพลาดสำหรับการ redirect
        } else if (error.message.includes('timeout')) {
          message = 'การอัพโหลดไฟล์ใช้เวลานานเกินไป โปรดลองใช้ไฟล์ที่มีขนาดเล็กลง'
        } else if (error.message.includes('network')) {
          message = 'เกิดปัญหาเครือข่ายระหว่างการอัพโหลด โปรดตรวจสอบการเชื่อมต่อ'
        } else {
          message = error.message
        }
      }
      
      // แสดงข้อผิดพลาดเฉพาะกรณีที่ไม่ใช่ redirect
      if (error && !error.toString().includes('NEXT_REDIRECT')) {
        toast.error(message);
      }
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

        {/* ปี พ.ศ. */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            ปี พ.ศ. ที่ออกเอกสาร
          </label>
          <div className="relative">
            <input
              type="number"
              name="year"
              min="2500"
              max="2700"
              defaultValue={initialData?.year || new Date().getFullYear() + 543}
              placeholder="ระบุปี พ.ศ. เช่น 2567"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500">พ.ศ.</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">ระบุปี พ.ศ. ของเอกสาร เช่น 2567, 2568 เป็นต้น</p>
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
                <p className="text-xs text-gray-500">PDF หรือ Word (สูงสุด 100MB)</p>
              </div>
              <input 
                type="file"
                name="document"
                id="document"
                required={!initialData}
                accept=".pdf,.doc,.docx"
                onChange={handleDocumentChange}
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
            <span className="text-sm text-gray-700 ml-2">(</span>
            <span id="selected-document-size" className="text-sm font-medium text-gray-600 ml-1"></span>
            <span className="text-sm text-gray-700">)</span>
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
          
          {/* คำแนะนำขนาดไฟล์ */}
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <svg className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            หากพบปัญหาในการอัพโหลดไฟล์ขนาดใหญ่ แนะนำให้แบ่งไฟล์เป็นส่วนย่อยๆ หรือบีบอัดไฟล์ก่อนอัพโหลด
          </div>
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
                  <p className="text-xs text-gray-500">JPG, PNG หรือ WEBP</p>
                  <p className="text-xs text-gray-500">ภาพจะถูกบีบอัดเป็น WebP ขนาดไม่เกิน 0.5MB</p>
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
                <div className="relative w-full h-full">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="object-contain max-h-48 w-auto mx-auto"
                  />
                  {selectedImageFile && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-500">
                        ขนาดต้นฉบับ: {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB
                        <br />
                        ภาพจะถูกบีบอัดเป็น WebP ขนาดไม่เกิน 0.5MB
                      </p>
                    </div>
                  )}
                </div>
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