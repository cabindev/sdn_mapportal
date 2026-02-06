// app/api/reverse-geocode/route.ts
import { NextResponse } from 'next/server';
import { GISTDA_CONFIG } from '@/app/lib/config/gistda';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing coordinates' },
      { status: 400 }
    );
  }

  try {
    console.log('🌍 Reverse geocoding for:', { lat, lng });

    // เรียก GISTDA API
    const apiUrl = `${GISTDA_CONFIG.API_BASE_URL}/services/geo/address`;
    const response = await fetch(
      `${apiUrl}?lon=${lng}&lat=${lat}&local=t&key=${GISTDA_CONFIG.API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GISTDA API error:', response.status, errorText);
      throw new Error(`GISTDA API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ GISTDA API response:', data);

    // แปลง response จาก GISTDA
    let province = null;

    if (data.features && data.features.length > 0) {
      const properties = data.features[0].properties;

      // ลองหาชื่อจังหวัดจากหลายฟิลด์
      province = properties.province_t ||
                 properties.province ||
                 properties.changwat_t ||
                 properties.CHANGWAT_T ||
                 properties.chwngwat_t ||
                 null;

      console.log('📍 Found province:', province);
      console.log('🔍 All properties:', properties);
    }

    return NextResponse.json({
      province,
      raw: data // ส่ง raw data กลับไปด้วยเพื่อ debug
    });
  } catch (error) {
    console.error('❌ Error in reverse geocoding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address data', province: null },
      { status: 500 }
    );
  }
}
