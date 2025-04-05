// app/dashboard/components/charts/HealthZoneDistributionChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChartData, ChartProps } from '../types/chart';
import { getThaiZoneName } from '@/app/utils/healthZones';

export default function HealthZoneDistributionChart({ 
  data, 
  title = "การกระจายตามโซนสุขภาพ", 
  className = "" 
}: ChartProps) {
  const pieData = data as PieChartData[];

  // สีประจำโซน
  const zoneColors = {
    "north-upper": "#10b981", // สีเขียวเข้ม
    "north-lower": "#34d399", // สีเขียวอ่อน
    "northeast-upper": "#f59e0b", // สีส้มเข้ม
    "northeast-lower": "#fbbf24", // สีส้มอ่อน
    "central": "#3b82f6", // สีน้ำเงิน
    "east": "#8b5cf6", // สีม่วง
    "west": "#ec4899", // สีชมพู
    "south-upper": "#06b6d4", // สีฟ้าเข้ม
    "south-lower": "#67e8f9", // สีฟ้าอ่อน
    "bangkok": "#f43f5e", // สีแดง
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => 
                percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
              }
            >
              {pieData.map((entry) => (
                <Cell 
                  key={`cell-${entry.id}`} 
                  fill={entry.color || zoneColors[entry.id as keyof typeof zoneColors] || '#ccc'} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} รายการ`, '']}
              labelFormatter={(name) => `${name}`}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              formatter={(value) => getThaiZoneName(value as any) || value}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}