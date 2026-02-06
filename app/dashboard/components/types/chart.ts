// app/types/chart.ts
import { HealthZone } from '@/app/utils/healthZones';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  id?: string | number;
}

export interface BarChartData {
  name: string;
  count: number;
}

export interface LineChartData {
  date: string;
  count: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
  id?: string | number; // เพิ่ม id เพื่อรองรับ health zone code
}

export interface ChartProps {
  data: ChartData[] | BarChartData[] | LineChartData[] | PieChartData[];
  title?: string;
  className?: string;
}

export interface ChartStatisticData {
  totalDocuments: number;
  publishedDocuments: number;
  unpublishedDocuments: number;
  totalCategories: number;
  provincesWithDocuments: number;
  documentsByProvince: { name: string; count: number }[];
  documentsByCategory: { name: string; count: number; color: string }[];
  documentsCreatedByMonth: { date: string; count: number }[];
  documentsByHealthZone: { name: string; value: number; id: HealthZone; color: string }[]; // เพิ่มข้อมูลตามโซนสุขภาพ
}

