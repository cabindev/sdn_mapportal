// app/dashboard/components/charts/HealthZoneDistributionChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { PieChartData, ChartProps } from '../types/chart';
import { getThaiZoneName } from '@/app/utils/healthZones';

export default function HealthZoneDistributionChart({ 
  data, 
  title = "การกระจายตามโซนสุขภาพ", 
  className = "" 
}: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const pieData = data as PieChartData[];

  // สีมืออาชีพแบบสะอาด
  const professionalColors = [
    '#3B82F6', // น้ำเงินสะอาด
    '#10B981', // เขียวสะอาด
    '#F59E0B', // ส้มสะอาด
    '#8B5CF6', // ม่วงสะอาด
    '#EF4444', // แดงสะอาด
    '#06B6D4', // ฟ้าอมเขียวสะอาด
    '#EC4899', // ชมพูสะอาด
    '#84CC16', // เขียวอ่อนสะอาด
    '#F97316', // ส้มแดงสะอาด
    '#6366F1'  // ม่วงอมน้ำเงินสะอาด
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} รายการ ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        textStyle: {
          fontSize: 12,
          color: '#6B7280'
        },
        formatter: function(name: string) {
          return getThaiZoneName(name as any) || name;
        }
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['0%', '60%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: pieData.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: professionalColors[index % professionalColors.length],
              borderColor: '#FFFFFF',
              borderWidth: 2
            }
          }))
        }
      ]
    };

    chart.setOption(option);

    // ปรับขนาดเมื่อ resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [pieData, title]);

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div 
        ref={chartRef} 
        className="h-64 w-full"
      />
    </div>
  );
}