// app/lib/actions/categories/update.ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import prisma from '../../db'

export async function updateCategory(id: string, formData: FormData) {
 try {
   const name = formData.get('name')
   const description = formData.get('description')

   if (!name || typeof name !== 'string') {
     throw new Error('กรุณาระบุชื่อประเภทเอกสาร')
   }

   // ตรวจสอบชื่อซ้ำ ยกเว้นตัวเอง
   const existing = await prisma.categoryDoc.findFirst({
     where: { 
       name,
       NOT: { id: parseInt(id) }
     }
   })

   if (existing) {
     throw new Error('ชื่อประเภทเอกสารนี้มีอยู่แล้ว')
   }

   await prisma.categoryDoc.update({
     where: { id: parseInt(id) },
     data: {
       name,
       description: description?.toString() || ''
     }
   })

   revalidatePath('/dashboard/categories')
   redirect('/dashboard/categories')

 } catch (error) {
   if (error instanceof Prisma.PrismaClientKnownRequestError) {
     if (error.code === 'P2002') {
       throw new Error('ชื่อประเภทเอกสารนี้มีอยู่แล้ว')
     }
   }
   
   if (error instanceof Error) {
     throw error
   }
   
   throw new Error('ไม่สามารถแก้ไขประเภทเอกสารได้ กรุณาลองใหม่อีกครั้ง')
 }
}
