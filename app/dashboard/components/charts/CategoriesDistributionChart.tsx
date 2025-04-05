// app/dashboard/components/charts/CategoriesDistributionChart.tsx
'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';
import { BarChartData, ChartProps } from '../types/chart';
import { getCategoryColor } from '@/app/utils/colorGenerator';

export default function CategoriesDistributionChart({ 
  data, 
  title = "เอกสารแยกตามหมวดหมู่", 
  className = "" 
}: ChartProps) {
  const barData = data as BarChartData[];

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} รายการ`, 'จำนวน']}
              labelFormatter={(name) => `หมวดหมู่: ${name}`}
            />
            <Bar dataKey="count" name="จำนวนเอกสาร">
              {barData.map((entry, index) => {
                // ใช้ index+1 เป็น categoryId สำหรับการสร้างสี
                const color = getCategoryColor(index + 1).primary;
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}