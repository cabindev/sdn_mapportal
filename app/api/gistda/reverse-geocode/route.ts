// app/api/gistda/reverse-geocode/route.ts

import { NextResponse } from 'next/server'
import { GISTDA_CONFIG } from '@/app/lib/config/gistda'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing coordinates' },
      { status: 400 }
    )
  }

  try {
    // เพิ่ม logging
    console.log('Server: Fetching GISTDA data for coordinates:', { lat, lng });
    console.log('Server: Using API configs:', { 
      baseUrl: GISTDA_CONFIG.API_BASE_URL,
      keyPreview: GISTDA_CONFIG.API_KEY ? GISTDA_CONFIG.API_KEY.substring(0, 8) + '...' : 'undefined'
    });

    // สร้าง URL สำหรับ API call
    const apiUrl = `${GISTDA_CONFIG.API_BASE_URL}/services/geo/address`;
    
    const response = await fetch(
      `${apiUrl}?lon=${lng}&lat=${lat}&local=t&key=${GISTDA_CONFIG.API_KEY}`
    )
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server: GISTDA API error:', response.status, errorText);
      throw new Error(`GISTDA API request failed: ${response.status}`);
    }

    const data = await response.json()
    console.log('Server: GISTDA API response:', data);
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Server: Error fetching GISTDA data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address data' },
      { status: 500 }
    )
  }
}