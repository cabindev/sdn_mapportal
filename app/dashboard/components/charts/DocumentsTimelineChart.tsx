// app/dashboard/components/charts/DocumentsTimelineChart.tsx
'use client';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { LineChartData, ChartProps } from '../types/chart';

export default function DocumentsTimelineChart({ 
  data, 
  title = "เอกสารตามช่วงเวลา", 
  className = "" 
}: ChartProps) {
  const lineData = data as LineChartData[];

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={lineData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} รายการ`, 'จำนวน']}
              labelFormatter={(date) => `วันที่: ${date}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="จำนวนเอกสาร"
              stroke="#f97316"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}