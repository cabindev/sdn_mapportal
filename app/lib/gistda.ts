// app/lib/gistda.ts
import axios from 'axios'

interface GistdaAddress {
  geocode: number;
  province: string;
  district: string;
  subdistrict: string;
}

export async function getLocationAddress(lat: number, lng: number): Promise<GistdaAddress> {
  try {
    // เปลี่ยนเป็นเรียกผ่าน API Route
    const url = `/api/gistda/reverse-geocode`
    
    console.log('Fetching location data for:', { lat, lng })

    const response = await axios.get(url, {
      params: {
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
      }
    })

    console.log('API Response:', response.data)

    // ตรวจสอบข้อมูลที่ได้รับ
    if (!response.data || !response.data.province) {
      throw new Error('Invalid response from API')
    }

    return {
      geocode: response.data.geocode || 0,
      province: response.data.province,
      district: response.data.district,
      subdistrict: response.data.subdistrict
    }

  } catch (error) {
    console.error('Location API Error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data)
      console.error('Request config:', error.config)
    }
    throw new Error('ไม่สามารถดึงข้อมูลที่อยู่ได้')
  }
}