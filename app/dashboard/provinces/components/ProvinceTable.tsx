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
    <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
      
      {/* Mobile View - Cards */}
      <div className="lg:hidden">
        {sortedProvinces.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <MapPinIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="font-light">ไม่พบข้อมูลจังหวัดที่ตรงกับเงื่อนไขที่กำหนด</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/30">
            {sortedProvinces.map((province) => (
              <Link 
                key={province.name}
                href={`/dashboard/provinces/${encodeURIComponent(province.name)}`}
                className="block p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-100 rounded-lg mr-3">
                      <MapPinIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-light text-slate-900">{province.name}</h3>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-light">เอกสารทั้งหมด</span>
                    <div className="flex items-center mt-1">
                      <DocumentTextIcon className="w-4 h-4 text-slate-500 mr-1" />
                      <span className="font-light text-slate-900">{province.totalDocuments.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-light">เผยแพร่แล้ว</span>
                    <div className="flex items-center mt-1">
                      <DocumentCheckIcon className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="font-light text-slate-900">{province.publishedDocuments.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-light">หมวดหมู่</span>
                    <div className="flex items-center mt-1">
                      <FolderIcon className="w-4 h-4 text-slate-500 mr-1" />
                      <span className="font-light text-slate-900">{province.categoryCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
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
                    onClick={() => handleSort('name')}
                  >
                    จังหวัด
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-2" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-2" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('totalDocuments')}
                  >
                    จำนวนเอกสารทั้งหมด
                    {sortField === 'totalDocuments' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-2" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-2" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('publishedDocuments')}
                  >
                    เอกสารที่เผยแพร่
                    {sortField === 'publishedDocuments' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-2" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-2" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('categoryCount')}
                  >
                    จำนวนหมวดหมู่
                    {sortField === 'categoryCount' && (
                      sortDirection === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4 ml-2" /> : 
                      <ArrowDownIcon className="w-4 h-4 ml-2" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200/30">
              {sortedProvinces.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <MapPinIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="font-light">ไม่พบข้อมูลจังหวัดที่ตรงกับเงื่อนไขที่กำหนด</p>
                  </td>
                </tr>
              ) : (
                sortedProvinces.map((province) => (
                  <tr key={province.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-100 rounded-lg mr-3">
                          <MapPinIcon className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="text-sm font-light text-slate-900">{province.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-900 font-light">{province.totalDocuments.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentCheckIcon className="w-5 h-5 text-emerald-500 mr-3" />
                        <span className="text-sm text-slate-900 font-light">{province.publishedDocuments.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderIcon className="w-5 h-5 text-slate-500 mr-3" />
                        <span className="text-sm text-slate-900 font-light">{province.categoryCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/provinces/${encodeURIComponent(province.name)}`}
                        className="inline-flex items-center text-slate-600 hover:text-slate-900 font-light transition-colors"
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
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-200/50 text-slate-600 text-sm font-light">
        แสดง {sortedProvinces.length.toLocaleString()} รายการ 
        {provinces.length > 0 ? ` จากทั้งหมด ${provinces.length.toLocaleString()} รายการ` : ''}
      </div>
    </div>
  )
}