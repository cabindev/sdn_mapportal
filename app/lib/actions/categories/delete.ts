// app/lib/actions/categories/delete.ts
'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '../../db'

export async function deleteCategory(id: number) {
  try {
    const documentsCount = await prisma.document.count({
      where: { categoryId: id }
    })

    if (documentsCount > 0) {
      throw new Error('Cannot delete category with existing documents')
    }

    await prisma.categoryDoc.delete({ where: { id } })
    revalidatePath('/dashboard/categories')
  } catch (error) {
    throw new Error('Failed to delete category')
  }
}