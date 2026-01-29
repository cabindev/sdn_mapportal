//app/components/auth/SignUpForm.tsx 
'use client'

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  image: File | null
}

export default function SignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    image: null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const router = useRouter()

  const compressImage = async (file: File): Promise<File> => {
    setCompressing(true)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // ปรับขนาดภาพถ้าจำเป็น
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * MAX_WIDTH / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * MAX_HEIGHT / height)
              height = MAX_HEIGHT
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // ลดคุณภาพทีละนิดจนกว่าจะได้ขนาดที่ต้องการ
          let quality = 0.9
          let dataUrl
          let blob
          let compressedFile
          const fileType = file.type || 'image/jpeg'
          
          // ฟังก์ชันเพื่อทดสอบขนาดไฟล์
          const tryQuality = () => {
            dataUrl = canvas.toDataURL(fileType, quality)
            
            // แปลง Data URL เป็น Blob
            const byteString = atob(dataUrl.split(',')[1])
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }
            
            blob = new Blob([ab], { type: fileType })
            
            // แปลง Blob เป็น File
            compressedFile = new File([blob], file.name, {
              type: fileType,
              lastModified: Date.now()
            })
            
            if (compressedFile.size > 500000 && quality > 0.1) {
              // ลดคุณภาพและลองอีกครั้ง
              quality -= 0.1
              setTimeout(tryQuality, 0) // ใช้ setTimeout เพื่อหลีกเลี่ยง stack overflow
            } else {
              setCompressing(false)
              resolve(compressedFile)
            }
          }
          
          tryQuality()
        }
        
        img.onerror = (error) => {
          setCompressing(false)
          reject(error)
        }
      }
      
      reader.onerror = (error) => {
        setCompressing(false)
        reject(error)
      }
      
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ตรวจสอบประเภทไฟล์
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('กรุณาอัพโหลดไฟล์รูปภาพ (JPG, PNG, WEBP)')
        return
      }

      try {
        // บีบอัดรูปภาพ
        const compressedFile = await compressImage(file)
        
        // อัปเดตฟอร์มด้วยไฟล์ที่ถูกบีบอัดแล้ว
        setFormData({ ...formData, image: compressedFile })
        
        // แสดงตัวอย่างรูปภาพ
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(compressedFile)
        
        // ล้างข้อความแจ้งเตือนถ้ามี
        setError(null)
      } catch (err) {
        console.error('ไม่สามารถบีบอัดรูปภาพได้:', err)
        setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
 
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value)
      })
 
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: data
      })
 
      if (response.ok) {
        router.push('/auth/signin')
      } else {
        const error = await response.json()
        setError(error.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            สมัครสมาชิก
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            เข้าถึงบริการและข้อมูลเอกสารต่างๆ ได้ง่ายขึ้น
          </p>
        </div>
 
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  ชื่อ
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
 
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  นามสกุล
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
 
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
 
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="รหัสผ่านอย่างน้อย 5 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">รหัสผ่านต้องมีความยาวอย่างน้อย 5 ตัวอักษร</p>
            </div>
 
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                รูปโปรไฟล์ <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
              </label>
              <div className="mt-1 flex items-center">
                <div className={`flex-shrink-0 h-16 w-16 rounded-full ${!imagePreview ? 'bg-gray-100 flex items-center justify-center' : ''} overflow-hidden mr-4`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-8 w-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={compressing}
                    className={`block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100
                      ${compressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {compressing ? (
                    <p className="mt-1 text-xs text-orange-600 flex items-center">
                      <svg className="animate-spin mr-2 h-3 w-3 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังประมวลผลรูปภาพ...
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">รองรับไฟล์ JPG, PNG หรือ WEBP (รูปภาพจะถูกบีบอัดอัตโนมัติ)</p>
                  )}
                </div>
              </div>
            </div>
          </div>
 
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
 
          <button
            type="submit"
            disabled={isLoading || compressing}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading || compressing
                ? "bg-orange-400 cursor-not-allowed" 
                : "bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            }`}
          >
            {isLoading ? 
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังดำเนินการ...
              </span> 
              : compressing ?
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังประมวลผลรูปภาพ...
              </span>
              : "สมัครสมาชิก"
            }
          </button>
 
          <div className="text-center text-sm">
            <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
            <Link href="/auth/signin" className="font-medium text-orange-600 hover:text-orange-500">
              เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}