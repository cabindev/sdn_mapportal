import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_ORIGINS = [
  'https://sdnthailand.com',
  'https://www.sdnthailand.com',
  'http://localhost:3001',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  return headers;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin');

  try {
    const documents = await prisma.document.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        province: true,
        amphoe: true,
        district: true,
        latitude: true,
        longitude: true,
        year: true,
        viewCount: true,
        downloadCount: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents, {
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error('Error fetching public documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}
