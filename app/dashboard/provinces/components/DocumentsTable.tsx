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
import type { Document } from '@/app/dashboard/components/types/province'

interface DocumentsTableProps {
  documents: Document[];
  provinceName: string;
}

export default function DocumentsTable({ 
  documents = [],
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
  
  // ข้อมูลที่เรียงแล้ว
  const sortedDocuments = Array.isArray(documents) ? [...documents].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === undefined && bValue !== undefined) return sortDirection === 'asc' ? -1 : 1
    if (aValue !== undefined && bValue === undefined) return sortDirection === 'asc' ? 1 : -1
    if (aValue === undefined && bValue === undefined) return 0
    
    if (aValue! < bValue!) return sortDirection === 'asc' ? -1 : 1
    if (aValue! > bValue!) return sortDirection === 'asc' ? 1 : -1
    return 0
  }) : [];
  
  // ฟังก์ชันส่งออกเป็น CSV
  const exportToCSV = () => {
    const headers = [
      'ชื่อเอกสาร', 'หมวดหมู่', 'ตำบล', 'อำเภอ', 'จังหวัด', 
      'ปี', 'จำนวนการดาวน์โหลด', 'สถานะ', 'วันที่สร้าง', 'ผู้สร้าง'
    ];
    
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
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `เอกสารจังหวัด${provinceName}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 flex justify-between items-center">
        <h3 className="text-lg font-light text-slate-900">ตารางแสดงข้อมูลเอกสาร</h3>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center font-light"
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          ส่งออก CSV
        </button>
      </div>
      
      {/* Mobile View - Cards */}
      <div className="lg:hidden">
        {sortedDocuments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="font-light">ไม่พบข้อมูลเอกสารที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/30">
            {sortedDocuments.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start mb-3">
                  <DocumentTextIcon className="w-5 h-5 text-slate-500 mr-3 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <Link 
                      href={`/dashboard/documents/${doc.id}`} 
                      className="text-sm font-light text-slate-900 hover:text-slate-700 transition-colors"
                    >
                      {doc.title}
                    </Link>
                    {doc.description && (
                      <p className="text-sm text-slate-600 font-light line-clamp-2 mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <FolderIcon className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-slate-700 font-light">{doc.category?.name || 'ไม่ระบุ'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-slate-700 font-light">
                      {doc.district ? `${doc.district}, ${doc.amphoe || ''}` : (doc.amphoe || 'ไม่ระบุ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-slate-700 font-light">{doc.year || '-'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    {doc.isPublished ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                        <span className="text-emerald-700 font-light">เผยแพร่</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4 text-slate-500 mr-2" />
                        <span className="text-slate-700 font-light">ไม่เผยแพร่</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                  <div className="text-xs text-slate-500 font-light">
                    {formatDate(doc.createdAt)} • {doc.user?.firstName} {doc.user?.lastName}
                  </div>
                  
                  <Link
                    href={doc.filePath || '#'}
                    className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-light transition-colors ${
                      doc.filePath 
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                        : 'bg-slate-50 text-slate-400 cursor-not-allowed'
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
      
      {/* Desktop View - Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('title')}
                  >
                    ชื่องาน
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-2" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-2" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  ประเภทงาน
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('district')}
                  >
                    พื้นที่
                    {sortField === 'district' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-2" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-2" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('year')}
                  >
                    ปี
                    {sortField === 'year' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-2" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-2" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  ดาวน์โหลด
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200/30">
              {sortedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="font-light">ไม่พบข้อมูลเอกสารที่ตรงกับเงื่อนไข</p>
                  </td>
                </tr>
              ) : (
                sortedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <DocumentTextIcon className="w-5 h-5 text-slate-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <Link 
                            href={`/dashboard/documents/${doc.id}`} 
                            className="text-sm font-light text-slate-900 hover:text-slate-700 transition-colors"
                          >
                            {doc.title}
                          </Link>
                          {doc.description && (
                            <div className="text-sm text-slate-600 font-light line-clamp-2 mt-1">{doc.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderIcon className="w-5 h-5 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-900 font-light">{doc.category?.name || 'ไม่ระบุ'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-light">{doc.district || '-'}</div>
                      {doc.amphoe && <div className="text-xs text-slate-500 font-light">{doc.amphoe}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-900 font-light">{doc.year || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-light rounded-lg ${
                        doc.isPublished 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {doc.isPublished ? 'เผยแพร่' : 'ไม่เผยแพร่'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={doc.filePath || '#'}
                        className={`inline-flex items-center p-2 rounded-lg transition-colors ${
                          doc.filePath 
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                            : 'text-slate-400 cursor-not-allowed'
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
      
      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-200/50 text-slate-600 text-sm font-light">
        แสดง {sortedDocuments.length.toLocaleString()} รายการ 
        {Array.isArray(documents) && documents.length > 0 ? ` จากทั้งหมด ${documents.length.toLocaleString()} รายการ` : ''}
      </div>
    </div>
  )
}