// app/dashboard/components/charts/ProvinceDistributionChart.tsx
'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BarChartData, ChartProps } from '../types/chart';

export default function ProvinceDistributionChart({ 
  data, 
  title = "เอกสารจำแนกตามจังหวัด", 
  className = "" 
}: ChartProps) {
  const barData = data as BarChartData[];

  // เรียงลำดับข้อมูลจากมากไปน้อย
  const sortedData = [...barData].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 80,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip 
              formatter={(value) => [`${value} รายการ`, 'จำนวน']}
              labelFormatter={(name) => `จังหวัด: ${name}`}
            />
            <Bar dataKey="count" name="จำนวนเอกสาร" fill="#f97316" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}