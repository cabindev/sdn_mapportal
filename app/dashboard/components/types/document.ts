// dashboard/components/types/document.ts
import { Document, CategoryDoc } from '@prisma/client'

// Document กับ Category
export interface DocumentWithCategory extends Document {
  category: CategoryDoc
}

// Props สำหรับ Form
export interface DocumentFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  isSubmitting: boolean
  initialData?: DocumentWithCategory
}

// Region Data
export interface RegionData {
    district: string
    amphoe: string
    province: string
    type?: string  // ทำให้เป็น optional
    zipcode: number
    district_code: number
    amphoe_code: number
    province_code: number
  }

// Form States
export interface DocumentFormState {
  error: string
  categories: CategoryDoc[]
  selectedFile: File | null
  selectedImage: File | null
  previewImage: string | null
  searchTerm: string
  showRegions: boolean
  selectedRegion: RegionData | null
  filteredRegions: RegionData[]
  isLoadingRegions: boolean
}

// Constants
export const MAX_FILE_SIZE = 10 // MB for documents
export const MAX_IMAGE_SIZE = 5 // MB for images