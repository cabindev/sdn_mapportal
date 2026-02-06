// app/types/map.ts
import { Document, CategoryDoc } from '@prisma/client'

export interface MapDocument extends Document {
  category: CategoryDoc
}

export interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    name: string
    name_th: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface GeoJSONData {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface RegionData {
  district: string
  amphoe: string
  province: string
  zipcode: number
  district_code: number
  amphoe_code: number
  province_code: number
}

export interface ProvinceCoordinate {
  province: string
  latitude: number
  longitude: number
}