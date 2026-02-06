// lib/config/gistda.ts
export const GISTDA_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_GISTDA_API_KEY || '5F37E1A676594C2B8AA3C646AFA400EC', 
  API_BASE_URL: process.env.GISTDA_API_BASE_URL || 'https://api.sphere.gistda.or.th',
  DEFAULT_CENTER: {
    lat: 13.7563,
    lng: 100.5018
  },
  DEFAULT_ZOOM: 6,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  STYLES: {
    default: 'default',
    satellite: 'satellite',
    hybrid: 'hybrid',
    terrain: 'terrain'
  }
}