// app/lib/actions/documents/create.ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '@/app/lib/db'
import { uploadFile } from '@/app/lib/upload'
import { mkdir } from 'fs/promises'
import path from 'path'
import { getServerSession } from "next-auth/next"
import authOptions from '../../configs/auth/authOptions'

// ค่าคงที่สำหรับจำกัดขนาดไฟล์ (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export async function createDocument(formData: FormData) {
  try {
    // ดึงข้อมูล session ด้วย getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new Error("คุณต้องเข้าสู่ระบบก่อนทำรายการนี้");
    }
    
    // ตรวจสอบว่ามี userId หรือไม่
    const userId = session.user.id;
    if (!userId) {
      throw new Error("ไม่สามารถระบุตัวตนผู้ใช้ได้");
    }

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
    
    // ตรวจสอบขนาดของไฟล์เอกสาร
    if (documentFile.size > MAX_FILE_SIZE) {
      throw new Error(`ขนาดไฟล์เกิน 100MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า`)
    }
    
    // ตรวจสอบขนาดของไฟล์รูปภาพ (ถ้ามี)
    if (coverImage && coverImage.size > MAX_FILE_SIZE) {
      throw new Error(`ขนาดไฟล์รูปภาพเกิน 100MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า`)
    }

    // 4. ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
    const documentsDir = path.join(process.cwd(), 'public', 'documents')
    const coversDir = path.join(process.cwd(), 'public', 'covers')
    
    try {
      await mkdir(documentsDir, { recursive: true })
      await mkdir(coversDir, { recursive: true })
    } catch (error) {
      console.error('Error creating directories:', error)
      throw new Error('เกิดข้อผิดพลาดในการเตรียมระบบไฟล์ กรุณาลองใหม่อีกครั้ง')
    }

    // 5. อัพโหลดไฟล์
    let filePath: string
    let coverImagePath: string | null = null

    try {
      // ข้อความสำหรับแสดงความคืบหน้า (ถ้าต้องการเพิ่มในอนาคต)
      console.log(`กำลังอัพโหลดไฟล์เอกสารขนาด ${(documentFile.size / (1024 * 1024)).toFixed(2)} MB...`)
      
      filePath = await uploadFile(documentFile, 'documents')
      
      if (coverImage && coverImage.size > 0) {
        console.log(`กำลังอัพโหลดรูปภาพขนาด ${(coverImage.size / (1024 * 1024)).toFixed(2)} MB...`)
        coverImagePath = await uploadFile(coverImage, 'covers')
      }
      
      console.log('อัพโหลดไฟล์เสร็จสิ้น')
    } catch (error) {
      console.error('File upload error:', error)
      // ข้อความแสดงข้อผิดพลาดที่เฉพาะเจาะจงมากขึ้น
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('การอัพโหลดไฟล์ใช้เวลานานเกินไป โปรดลองใช้ไฟล์ที่มีขนาดเล็กลง')
        } else if (error.message.includes('network')) {
          throw new Error('เกิดปัญหาเครือข่ายระหว่างการอัพโหลด โปรดตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง')
        }
      }
      throw new Error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์ โปรดลองใหม่อีกครั้ง')
    }

    // แปลง userId เป็นตัวเลข
    const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;

    // 6. บันทึกข้อมูล
    console.log('กำลังบันทึกข้อมูลลงฐานข้อมูล...')
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
        year,
        filePath,
        coverImage: coverImagePath,
        isPublished,
        userId: typeof userId === 'string' ? parseInt(userId) : userId
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