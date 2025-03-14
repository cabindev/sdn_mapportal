// app/lib/actions/documents/create.ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '@/app/lib/db'
import { uploadFile } from '@/app/lib/upload'
import { mkdir } from 'fs/promises'
import path from 'path'

export async function createDocument(formData: FormData) {
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
    const zone = formData.get('zone') as string || null
    const isPublished = formData.get('isPublished') === 'on' || formData.get('isPublished') === 'true'
    
    // ดึงค่าปี พ.ศ.
    const yearValue = formData.get('year')?.toString()
    const year = yearValue ? parseInt(yearValue) : null

    // 2. ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !description || !categoryId || !district || !amphoe || !province) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน')
    }
    
    // ตรวจสอบค่าปีว่าถูกต้องหรือไม่
    if (yearValue && (isNaN(year!) || year! < 2500 || year! > 2700)) {
      throw new Error('กรุณาระบุปี พ.ศ. ที่ถูกต้อง (2500-2700)')
    }

    // 3. ตรวจสอบไฟล์
    const documentFile = formData.get('document') as File | Blob | null
    const coverImage = formData.get('coverImage') as File | Blob | null

    if (!documentFile) {
      throw new Error('กรุณาเลือกไฟล์เอกสาร')
    }

    // 4. ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
    const documentsDir = path.join(process.cwd(), 'public', 'documents')
    const coversDir = path.join(process.cwd(), 'public', 'covers')
    
    try {
      await mkdir(documentsDir, { recursive: true })
      await mkdir(coversDir, { recursive: true })
    } catch (error) {
      console.error('Error creating directories:', error)
    }

    // 5. อัพโหลดไฟล์
    let filePath: string
    let coverImagePath: string | null = null

    try {
      filePath = await uploadFile(documentFile, 'documents')
      if (coverImage && coverImage.size > 0) {
        coverImagePath = await uploadFile(coverImage, 'covers')
      }
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์')
    }

    // 6. บันทึกข้อมูล
    const newDocument = await prisma.document.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId),
        district,
        amphoe,
        province,
        latitude: latitude ? parseFloat(latitude) : 0,
        longitude: longitude ? parseFloat(longitude) : 0,
        year,  // เพิ่มค่าปี พ.ศ.
        filePath,
        coverImage: coverImagePath,
        isPublished
      }
    })

    console.log('Document created successfully:', newDocument)

    // 7. Revalidate และ redirect
    revalidatePath('/dashboard/documents')
    redirect('/dashboard/documents')

  } catch (error) {
    // Don't log redirects as errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw so Next.js can handle the redirect
    }
    
    console.error('Create document error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('เกิดข้อผิดพลาดในการบันทึกเอกสาร')
  }
}