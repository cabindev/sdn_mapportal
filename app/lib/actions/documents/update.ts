// lib/actions/documents/update.ts
'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../../db'
import { uploadFile } from '../../upload'

export async function updateDocument(id: string, formData: FormData) {
  try {
    // 1. ดึงข้อมูลจาก FormData
    const title = formData.get('title')?.toString()
    const description = formData.get('description')?.toString()
    const categoryId = formData.get('categoryId')?.toString()
    const district = formData.get('district')?.toString()
    const amphoe = formData.get('amphoe')?.toString()
    const province = formData.get('province')?.toString()
    const latitude = formData.get('latitude')?.toString()
    const longitude = formData.get('longitude')?.toString()
    
    // ตรวจสอบค่า isPublished (checkbox จะส่งค่ามาเฉพาะเมื่อถูกเลือก)
    const isPublished = formData.has('isPublished')
    console.log('isPublished value in server action:', isPublished)

    // 2. ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !description || !categoryId || !district || !amphoe || !province) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน')
    }

    // 3. เตรียมข้อมูลสำหรับอัพเดท
    const updateData: any = {
      title,
      description,
      categoryId: parseInt(categoryId),
      district,
      amphoe,
      province,
      latitude: latitude ? parseFloat(latitude) : 0,
      longitude: longitude ? parseFloat(longitude) : 0,
      isPublished, // เพิ่มค่า isPublished
    }

    // 4. ตรวจสอบและอัพโหลดไฟล์ใหม่ (ถ้ามี)
    const documentFile = formData.get('document') as File | Blob | null
    const coverImage = formData.get('coverImage') as File | Blob | null

    if (documentFile instanceof File && documentFile.size > 0) {
      try {
        const newFilePath = await uploadFile(documentFile, 'documents')
        updateData.filePath = newFilePath
      } catch (error) {
        console.error('Document upload error:', error)
        throw new Error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์เอกสาร')
      }
    }

    if (coverImage instanceof File && coverImage.size > 0) {
      try {
        const newCoverPath = await uploadFile(coverImage, 'covers')
        updateData.coverImage = newCoverPath
      } catch (error) {
        console.error('Cover image upload error:', error)
        throw new Error('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
      }
    }

    // 5. อัพเดทข้อมูลในฐานข้อมูล
    const updatedDocument = await prisma.document.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    // 6. คืนค่าข้อมูลที่อัพเดตแล้ว
    return updatedDocument

  } catch (error) {
    console.error('Error updating document:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('เกิดข้อผิดพลาดในการอัพเดทเอกสาร')
  }
}