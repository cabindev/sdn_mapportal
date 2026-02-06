// types/document.ts
import { CategoryDoc, Document, User, Role } from '@prisma/client'

// สำหรับข้อมูลตำแหน่ง
export interface LocationData {
  lat: number;
  lng: number;
  province: string;
  amphoe: string;
  district: string;
  geocode: number;
  zone?: string;  
}

// สำหรับข้อมูลภูมิภาค
export interface RegionData {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
  district_code: number;
  amphoe_code: number;
  province_code: number;
}

// สำหรับเอกสารที่มีข้อมูลหมวดหมู่และผู้อัปโหลด
export interface DocumentWithCategory extends Document {
  category: CategoryDoc;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
  isLatest?: boolean;
  year: number | null;  
}

// สำหรับการส่งข้อมูลฟอร์ม
export interface DocumentFormState {
  title: string;
  description: string;
  categoryId: number;
  filePath?: string;
  coverImage?: string | null;
  isPublished: boolean;
  location: LocationData;
}

// สำหรับ Props ของ DocumentForm component
export interface DocumentFormProps {
  categories: CategoryDoc[];
  location?: LocationData;
  initialData?: DocumentWithCategory;
  onClose?: () => void;
  onSuccess?: (doc: DocumentWithCategory) => Promise<void>;
  onUpdateLocation?: (location: LocationData) => void;
  action?: (formData: FormData) => Promise<void>;
}

// ค่าคงที่สำหรับการจำกัดขนาดไฟล์
export const MAX_FILE_SIZE = 10; // MB
export const MAX_IMAGE_SIZE = 5; // MB

// ประเภทของข้อผิดพลาด
export type DocumentError = {
  field: string;
  message: string;
}

// สถานะการโหลด
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

