// app/api/documents/download/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // แก้ไขเป็น await params
    const { id } = await params;
    const documentId = parseInt(id);
    
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    
    // อัพเดตจำนวนการดาวน์โหลด
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });
    
    // ล้างแคช
    revalidatePath('/dashboard/documents');
    revalidatePath('/dashboard/map');
    revalidateTag('documents');
    
    return NextResponse.json({ success: true, downloadCount: document.downloadCount });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json({ error: 'Failed to update download count' }, { status: 500 });
  }
}