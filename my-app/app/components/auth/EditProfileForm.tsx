//app/components/auth/EditProfileForm.tsx
'use client'

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface FormData {
  firstName: string
  lastName: string
  email: string
  image: File | null
}

export default function EditProfileForm({ userId }: { userId: string }) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    image: null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            image: null
          })
          setImagePreview(data.image)
        }
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
      }
    }

    fetchUserData()
  }, [userId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('กรุณาอัพโหลดไฟล์รูปภาพ (JPG, PNG, WEBP)')
        return
      }
      if (file.size > 500000) {
        setError('ขนาดไฟล์ต้องไม่เกิน 500KB')
        return
      }

      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: data
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const error = await response.json()
        setError(error.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            แก้ไขโปรไฟล์
          </h2>
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
              <input
                type="email"
                name="email"
                id="email"
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                value={formData.email}
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                รูปโปรไฟล์
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-orange-50 file:text-orange-700
                    hover:file:bg-orange-100"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading 
                  ? "bg-orange-400 cursor-not-allowed" 
                  : "bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              }`}
            >
              {isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}