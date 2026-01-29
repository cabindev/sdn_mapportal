// app/dashboard/components/charts/DocumentsOverviewChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { PieChartData, ChartProps } from '../types/chart';

export default function DocumentsOverviewChart({ data, title = "สถิติเอกสาร", className = "" }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const pieData = data as PieChartData[];

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} รายการ ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        textStyle: {
          fontSize: 12,
          color: '#6B7280'
        }
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: pieData.map((item, index) => {
            // สีมืออาชีพแบบสะอาด
            const professionalColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
            return {
              value: item.value,
              name: item.name,
              itemStyle: {
                color: professionalColors[index % professionalColors.length],
                borderColor: '#FFFFFF',
                borderWidth: 2
              }
            };
          })
        }
      ]
    };

    chart.setOption(option);

    // ห้ามคลิกขวาใน tooltip
    chart.on('click', function(params) {
      console.log('คลิกที่:', params.name, params.value);
    });

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