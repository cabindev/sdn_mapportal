// app/dashboard/components/charts/RecentActivitiesChart.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarClock, FileText, Upload, Clock, Edit } from "lucide-react";

interface Activity {
  id: number;
  type: 'new' | 'update' | 'publish';
  documentName: string;
  userName: string;
  timestamp: string;
  documentId: number;
}

interface RecentActivitiesChartProps {
  data: Activity[];
  title: string;
  className?: string;
}

export default function RecentActivitiesChart({ data, title, className = '' }: RecentActivitiesChartProps) {
  // ฟังก์ชันสำหรับเลือกไอคอนตามประเภทกิจกรรม
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'update':
        return <Edit className="h-5 w-5 text-amber-500" />;
      case 'publish':
        return <Upload className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // ฟังก์ชันสำหรับแปลงประเภทกิจกรรมเป็นข้อความภาษาไทย
  const getActivityText = (type: string) => {
    switch (type) {
      case 'new':
        return 'สร้างเอกสารใหม่';
      case 'update':
        return 'แก้ไขเอกสาร';
      case 'publish':
        return 'เผยแพร่เอกสาร';
      default:
        return 'กิจกรรม';
    }
  };

  // ฟังก์ชันสำหรับจัดรูปแบบวันที่
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // แสดงวันที่ในรูปแบบ "1 ม.ค. 2567, 13:45 น."
    return new Intl.DateTimeFormat('th-TH', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // ฟังก์ชันสำหรับลดความยาวข้อความ
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="text-base font-medium flex items-center">
          <CalendarClock className="mr-2 h-5 w-5 text-gray-500" />
          {title}
        </h3>
      </div>
      <div className="p-6 pt-0">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>ไม่พบกิจกรรมล่าสุด</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="mt-0.5 mr-3 p-1.5 bg-gray-50 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <Link 
                    href={`/dashboard/documents/${activity.documentId}`}
                    className="text-sm font-medium hover:text-blue-600 transition-colors"
                  >
                    {getActivityText(activity.type)}: {truncateText(activity.documentName, 40)}
                  </Link>
                  <div className="flex flex-col sm:flex-row sm:justify-between mt-1">
                    <p className="text-xs text-gray-500">โดย {activity.userName}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}