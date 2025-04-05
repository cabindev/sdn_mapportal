// app/dashboard/provinces/components/ProvinceTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  FolderIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { Province } from '@/app/dashboard/components/types/province'

interface ProvinceTableProps {
  provinces: Province[];
  regionFilter: string;
  searchFilter: string;
}

export default function ProvinceTable({ 
  provinces, 
  regionFilter,
  searchFilter
}: ProvinceTableProps) {
  const [sortField, setSortField] = useState<keyof Province>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // ฟังก์ชันเรียงข้อมูล
  const handleSort = (field: keyof Province) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  // ข้อมูลที่เรียงแล้ว
  const sortedProvinces = [...provinces].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })
  
  return (
    <>
      {/* การแสดงผลบนมือถือ (แบบการ์ด) */}
      <div className="md:hidden">
        {sortedProvinces.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            ไม่พบข้อมูลจังหวัดที่ตรงกับเงื่อนไขที่กำหนด
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 px-4 py-4">
            {sortedProvinces.map((province) => (
              <Link 
                key={province.name}
                href={`/dashboard/provinces/${encodeURIComponent(province.name)}`}
                className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <MapPinIcon className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">{province.name}</h3>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">เอกสารทั้งหมด</span>
                      <div className="flex items-center mt-1">
                        <DocumentTextIcon className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="font-medium">{province.totalDocuments}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">เผยแพร่แล้ว</span>
                      <div className="flex items-center mt-1">
                        <DocumentCheckIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="font-medium">{province.publishedDocuments}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">หมวดหมู่</span>
                      <div className="flex items-center mt-1">
                        <FolderIcon className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="font-medium">{province.categoryCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* แสดงจำนวนรายการสำหรับมือถือ */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-gray-500 text-sm">
          แสดง {sortedProvinces.length} รายการ {provinces.length > 0 ? `จากทั้งหมด ${provinces.length} รายการ` : ''}
        </div>
      </div>
      
      {/* การแสดงผลบนหน้าจอขนาดใหญ่ (แบบตาราง) */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort('name')}
                  >
                    จังหวัด
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort('totalDocuments')}
                  >
                    จำนวนเอกสารทั้งหมด
                    {sortField === 'totalDocuments' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort('publishedDocuments')}
                  >
                    เอกสารที่เผยแพร่
                    {sortField === 'publishedDocuments' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort('categoryCount')}
                  >
                    จำนวนหมวดหมู่
                    {sortField === 'categoryCount' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProvinces.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลจังหวัดที่ตรงกับเงื่อนไขที่กำหนด
                  </td>
                </tr>
              ) : (
                sortedProvinces.map((province) => (
                  <tr key={province.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{province.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-900">{province.totalDocuments.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">{province.publishedDocuments.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderIcon className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">{province.categoryCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/provinces/${encodeURIComponent(province.name)}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        รายละเอียด
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* แสดงจำนวนรายการสำหรับหน้าจอใหญ่ */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-gray-500 text-sm">
          แสดง {sortedProvinces.length} รายการ {provinces.length > 0 ? `จากทั้งหมด ${provinces.length} รายการ` : ''}
        </div>
      </div>
    </>
  )
}