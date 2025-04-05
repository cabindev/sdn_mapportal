// app/dashboard/provinces/components/DocumentsTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

// นำเข้า interface จากตำแหน่งที่ถูกต้อง
import type { Document } from '@/app/dashboard/components/types/province'

interface DocumentsTableProps {
  documents: Document[];
  provinceName: string;
}

export default function DocumentsTable({ 
  documents = [], // ตั้งค่าเริ่มต้นเป็น array ว่างเพื่อป้องกัน error
  provinceName 
}: DocumentsTableProps) {
  const [sortField, setSortField] = useState<keyof Document>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // ฟังก์ชันเรียงข้อมูล
  const handleSort = (field: keyof Document) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  // ข้อมูลที่เรียงแล้ว - ตรวจสอบว่า documents มีค่าและเป็น array
  const sortedDocuments = Array.isArray(documents) ? [...documents].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    // จัดการกับค่า undefined หรือ null
    if (aValue === undefined && bValue !== undefined) return sortDirection === 'asc' ? -1 : 1
    if (aValue !== undefined && bValue === undefined) return sortDirection === 'asc' ? 1 : -1
    if (aValue === undefined && bValue === undefined) return 0
    
    // เปรียบเทียบค่าทั่วไป
    if (aValue! < bValue!) return sortDirection === 'asc' ? -1 : 1
    if (aValue! > bValue!) return sortDirection === 'asc' ? 1 : -1
    return 0
  }) : [];
  
  // ฟังก์ชันส่งออกเป็น CSV
  const exportToCSV = () => {
    // สร้างหัวคอลัมน์
    const headers = [
      'ชื่อเอกสาร', 'หมวดหมู่', 'ตำบล', 'อำเภอ', 'จังหวัด', 
      'ปี', 'จำนวนการดาวน์โหลด', 'สถานะ', 'วันที่สร้าง', 'ผู้สร้าง'
    ];
    
    // สร้างแถวข้อมูล
    const rows = sortedDocuments.map(doc => [
      `"${doc.title.replace(/"/g, '""')}"`,
      doc.category?.name || '',
      doc.district || '',
      doc.amphoe || '',
      provinceName,
      doc.year || '',
      doc.downloadCount || 0,
      doc.isPublished ? 'เผยแพร่แล้ว' : 'ไม่เผยแพร่',
      new Date(doc.createdAt).toLocaleDateString('th-TH'),
      `${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`
    ]);
    
    // รวมหัวคอลัมน์และข้อมูลทั้งหมด
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // สร้าง Blob และ URL
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // สร้าง element a สำหรับดาวน์โหลด
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `เอกสารจังหวัด${provinceName}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // เพิ่ม element เข้า DOM, คลิก, และลบ
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-700">ตารางแสดงข้อมูลเอกสาร</h2>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          CSV
        </button>
      </div>
      
      {/* แสดงเป็นการ์ดบนมือถือ */}
      <div className="md:hidden">
        {sortedDocuments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            ไม่พบข้อมูลเอกสารที่ตรงกับเงื่อนไข
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedDocuments.map((doc) => (
              <div key={doc.id} className="p-4">
                <div className="flex items-start mb-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <Link href={`/dashboard/documents/${doc.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      {doc.title}
                    </Link>
                    {doc.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="flex items-center">
                    <FolderIcon className="w-4 h-4 text-orange-500 mr-1.5" />
                    <span className="text-gray-700">{doc.category?.name || 'ไม่ระบุ'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 text-blue-500 mr-1.5" />
                    <span className="text-gray-700">
                      {doc.district ? `${doc.district}, ${doc.amphoe || ''}` : (doc.amphoe || 'ไม่ระบุ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 text-gray-500 mr-1.5" />
                    <span className="text-gray-700">{doc.year || '-'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    {doc.isPublished ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1.5" />
                        <span className="text-green-700">เผยแพร่</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-700">ไม่เผยแพร่</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center border-t border-gray-100 pt-3">
                  <div className="text-xs text-gray-500">
                    {formatDate(doc.createdAt)} • {doc.user?.firstName} {doc.user?.lastName}
                  </div>
                  
                  <Link
                    href={doc.filePath || '#'}
                    className={`inline-flex items-center rounded px-2.5 py-1.5 text-xs font-medium ${
                      doc.filePath 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    download={!!doc.filePath}
                    onClick={(e) => !doc.filePath && e.preventDefault()}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                    ดาวน์โหลด
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* แสดงเป็นตารางบนหน้าจอใหญ่ */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort('title')}
                  >
                    ชื่องาน
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประเภทงาน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort('district')}
                  >
                    พื้นที่
                    {sortField === 'district' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort('year')}
                  >
                    ปี
                    {sortField === 'year' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ดาวน์โหลด
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลเอกสารที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                sortedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <Link href={`/dashboard/documents/${doc.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {doc.title}
                          </Link>
                          {doc.description && (
                            <div className="text-sm text-gray-500 line-clamp-2">{doc.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderIcon className="w-5 h-5 text-orange-500 mr-2" />
                        <span className="text-sm text-gray-900">{doc.category?.name || 'ไม่ระบุ'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.district || '-'}</div>
                      {doc.amphoe && <div className="text-xs text-gray-500">{doc.amphoe}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-900">{doc.year || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doc.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.isPublished ? 'เผยแพร่' : 'ไม่เผยแพร่'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={doc.filePath || '#'}
                        className={`inline-flex items-center ${
                          doc.filePath 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        download={!!doc.filePath}
                        onClick={(e) => !doc.filePath && e.preventDefault()}
                        title="ดาวน์โหลด"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* แสดงจำนวนรายการ */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-gray-500 text-sm">
        แสดง {sortedDocuments.length} รายการ {Array.isArray(documents) && documents.length > 0 ? `จากทั้งหมด ${documents.length} รายการ` : ''}
      </div>
    </div>
  )
}