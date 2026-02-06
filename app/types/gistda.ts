// types/gistda.ts
export interface GistdaAddress {
  geocode: number;
  province: string;
  district: string;
  subdistrict: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  province: string;
  amphoe: string;
  district: string;
  geocode: number;
}

export interface GistdaMapProps {
  onLocationSelect?: (location: LocationData) => void;
  initialLocation?: {
    lat: number;
    lng: number;
  };
}