// app/dashboard/components/charts/DashboardCharts.tsx
'use client';

import { ChartStatisticData } from '../types/chart';
import DocumentsOverviewChart from './DocumentsOverviewChart';
import CategoriesDistributionChart from './CategoriesDistributionChart';
import DocumentsTimelineChart from './DocumentsTimelineChart';
import ProvinceDistributionChart from './ProvinceDistributionChart';
import HealthZoneDistributionChart from './HealthZoneDistributionChart';

interface DashboardChartsProps {
  statisticData: ChartStatisticData;
}

export default function DashboardCharts({ statisticData }: DashboardChartsProps) {
  // เตรียมข้อมูลสำหรับ Overview Chart (Pie Chart)
  const overviewData = [
    { name: 'เผยแพร่', value: statisticData.publishedDocuments, color: '#22c55e' },
    { name: 'ไม่เผยแพร่', value: statisticData.unpublishedDocuments, color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <DocumentsOverviewChart 
        data={overviewData} 
        title="สถิติการเผยแพร่เอกสาร"
      />
      
      <HealthZoneDistributionChart 
        data={statisticData.documentsByHealthZone} 
        title="การกระจายตามโซนสุขภาพ"
      />
      
      <CategoriesDistributionChart 
        data={statisticData.documentsByCategory} 
        title="เอกสารแยกตามประเภทงาน"
      />
      
      <DocumentsTimelineChart 
        data={statisticData.documentsCreatedByMonth} 
        title="เอกสารตามช่วงเวลา"
      />
      
      <ProvinceDistributionChart 
        data={statisticData.documentsByProvince} 
        title="จังหวัดที่มีเอกสารมากที่สุด (10 อันดับแรก)"
        className="lg:col-span-2"
      />
    </div>
  );
}