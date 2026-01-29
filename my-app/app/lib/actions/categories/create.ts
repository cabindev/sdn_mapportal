// app/lib/actions/categories/create.ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import prisma from '../../db'

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get('name')
    const description = formData.get('description')

    if (!name || typeof name !== 'string') {
      throw new Error('กรุณาระบุชื่อประเภทเอกสาร')
    }

    // ตรวจสอบชื่อซ้ำก่อน
    const existing = await prisma.categoryDoc.findFirst({
      where: { name }
    })

    if (existing) {
      throw new Error('ชื่อประเภทเอกสารนี้มีอยู่แล้ว')
    }

    const category = await prisma.categoryDoc.create({
      data: {
        name,
        description: description?.toString() || ''
      }
    })

    revalidatePath('/dashboard/categories')
    redirect('/dashboard/categories')

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // จัดการ Prisma error
      if (error.code === 'P2002') {
        throw new Error('ชื่อประเภทเอกสารนี้มีอยู่แล้ว')
      }
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('ไม่สามารถสร้างประเภทเอกสารได้ กรุณาลองใหม่อีกครั้ง')
  }
}