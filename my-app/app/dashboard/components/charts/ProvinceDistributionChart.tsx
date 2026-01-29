// app/dashboard/components/charts/ProvinceDistributionChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { BarChartData, ChartProps } from '../types/chart';

export default function ProvinceDistributionChart({ 
  data, 
  title = "เอกสารจำแนกตามจังหวัด", 
  className = "" 
}: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const barData = data as BarChartData[];

  // เรียงลำดับข้อมูลจากมากไปน้อย
  const sortedData = [...barData].sort((a, b) => b.count - a.count).slice(0, 10);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          const data = params[0];
          return `จังหวัด: ${data.name}<br/>จำนวน: ${data.value} รายการ`;
        }
      },
      grid: {
        left: '20%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 11,
          color: '#6B7280'
        },
        axisLine: {
          lineStyle: {
            color: '#E5E7EB'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#F3F4F6'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(item => item.name),
        axisLabel: {
          fontSize: 11,
          color: '#6B7280'
        },
        axisLine: {
          lineStyle: {
            color: '#E5E7EB'
          }
        }
      },
      series: [
        {
          name: 'จำนวนเอกสาร',
          type: 'bar',
          data: sortedData.map((item, index) => {
            // สีมืออาชีพแบบสะอาด
            const professionalColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];
            return {
              value: item.count,
              itemStyle: {
                color: professionalColors[index % professionalColors.length],
                borderColor: '#FFFFFF',
                borderWidth: 0
              }
            };
          }),
          barWidth: '50%'
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
  }, [sortedData, title]);

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