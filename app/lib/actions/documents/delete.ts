// app/lib/actions/documents/delete.ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '../../db'
import fs from 'fs/promises'
import path from 'path'

export async function deleteDocument(id: string) {
  try {
    // Convert id to number
    const documentId = parseInt(id, 10)
    
    // Get document to find file paths before deletion
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      throw new Error('ไม่พบเอกสารที่ต้องการลบ')
    }

    // Delete document from database
    await prisma.document.delete({
      where: { id: documentId }
    })

    // Delete associated files if they exist
    if (document.filePath) {
      const documentPath = path.join(process.cwd(), 'public', document.filePath)
      try {
        await fs.unlink(documentPath)
      } catch (error) {
        console.error('Error deleting document file:', error)
      }
    }

    if (document.coverImage) {
      const imagePath = path.join(process.cwd(), 'public', document.coverImage)
      try {
        await fs.unlink(imagePath)
      } catch (error) {
        console.error('Error deleting cover image:', error)
      }
    }

    // Revalidate the documents list page
    revalidatePath('/dashboard/documents')
    
    return { success: true, message: 'ลบเอกสารเรียบร้อยแล้ว' }

  } catch (error) {
    console.error('Error deleting document:', error)
    throw new Error('เกิดข้อผิดพลาดในการลบเอกสาร')
  }
}