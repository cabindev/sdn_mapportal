// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);
    
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    
    // ดึงข้อมูล document พร้อม viewCount และ downloadCount ล่าสุด
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        viewCount: true,
        downloadCount: true
      }
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}