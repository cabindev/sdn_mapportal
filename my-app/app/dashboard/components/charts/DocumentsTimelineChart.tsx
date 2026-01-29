// app/dashboard/components/charts/DocumentsTimelineChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LineChartData, ChartProps } from '../types/chart';

export default function DocumentsTimelineChart({ 
  data, 
  title = "เอกสารตามช่วงเวลา", 
  className = "" 
}: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const lineData = data as LineChartData[];

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          const data = params[0];
          return `วันที่: ${data.name}<br/>จำนวน: ${data.value} รายการ`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: lineData.map(item => item.date),
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
      yAxis: {
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
      series: [
        {
          name: 'จำนวนเอกสาร',
          type: 'line',
          stack: 'Total',
          data: lineData.map(item => item.count),
          lineStyle: {
            color: '#3B82F6',
            width: 3
          },
          itemStyle: {
            color: '#3B82F6',
            borderColor: '#FFFFFF',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.1)'
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.02)'
              }
            ])
          },
          smooth: true
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
  }, [lineData, title]);

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