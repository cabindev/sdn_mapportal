// app/api/google-maps/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Maps API Key not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    apiKey: apiKey
  });
}