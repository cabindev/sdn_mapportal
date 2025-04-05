// app/dashboard/components/types/province.ts
export interface Province {
  name: string;
  totalDocuments: number;
  publishedDocuments: number;
  categoryCount: number;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  filePath: string | null;  // เพิ่ม null เพื่อรองรับค่า null จากฐานข้อมูล
  coverImage?: string | null;  // เพิ่ม null เพื่อรองรับค่า null จากฐานข้อมูล
  year?: number | null;  // เพิ่ม null เพื่อรองรับค่า null จากฐานข้อมูล
  viewCount: number;
  downloadCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  district: string | null;  // เพิ่ม null เพื่อรองรับค่า null จากฐานข้อมูล
  amphoe: string | null;  // เพิ่ม null เพื่อรองรับค่า null จากฐานข้อมูล
  province: string;
}

export interface CategoryStat {
  id: number;
  name: string;
  count: number;
}