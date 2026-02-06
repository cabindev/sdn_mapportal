import path from 'path'
import fs from 'fs/promises'

export async function uploadFile(file: File | Blob, folder: 'documents' | 'covers'): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // สร้างชื่อไฟล์ใหม่ด้วย timestamp + random
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    
    // ถ้าเป็น File จะมี name property
    const fileName = 'name' in file 
      ? `${timestamp}-${random}${path.extname(file.name)}`
      : `${timestamp}-${random}`
    
    // สร้าง path สำหรับบันทึกไฟล์
    const uploadDir = path.join(process.cwd(), 'public', folder)
    const filePath = path.join(uploadDir, fileName)
    
    // ตรวจสอบและสร้างโฟลเดอร์
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // เขียนไฟล์
    await fs.writeFile(filePath, buffer)
    
    return `/${folder}/${fileName}`

  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์')
  }
}

export async function deleteFile(filePath: string) {
  try {
    if (!filePath) return

    // ลบ / ออกจากต้น path ถ้ามี
    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
    
    // สร้าง full path
    const fullPath = path.join(process.cwd(), 'public', normalizedPath)

    // ตรวจสอบว่าไฟล์มีอยู่จริง
    try {
      await fs.access(fullPath)
    } catch {
      return // ถ้าไม่มีไฟล์ก็ไม่ต้องทำอะไร
    }

    // ลบไฟล์
    await fs.unlink(fullPath)

  } catch (error) {
    console.error('Delete file error:', error)
    throw new Error('เกิดข้อผิดพลาดในการลบไฟล์')
  }
}