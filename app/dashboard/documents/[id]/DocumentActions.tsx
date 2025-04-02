// app/dashboard/documents/[id]/DocumentActions.tsx
'use client'

import { EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface DocumentActionsProps {
  documentId: number;
  filePath: string;
  primaryColor: string;
}

export default function DocumentActions({ documentId, filePath, primaryColor }: DocumentActionsProps) {
  // ฟังก์ชันเพิ่มจำนวนการดู
  const handleViewDocument = async () => {
    try {
      await fetch(`/api/documents/view/${documentId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };
  
  // ฟังก์ชันเพิ่มจำนวนการดาวน์โหลด
  const handleDownload = async () => {
    try {
      await fetch(`/api/documents/download/${documentId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  return (
    <div className="flex gap-3">
      <a 
        href={filePath}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center py-2.5 px-4 bg-white border-2 rounded-lg text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-colors"
        style={{ borderColor: primaryColor }}
        onClick={handleViewDocument}
      >
        <EyeIcon className="w-4 h-4 mr-2" />
        ดูเอกสาร
      </a>
      
      <a 
        href={`${filePath}?download=true`}
        download
        className="flex-1 inline-flex items-center justify-center py-2.5 px-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-semibold text-sm hover:bg-gray-200 transition-colors"
        onClick={handleDownload}
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
        ดาวน์โหลด
      </a>
    </div>
  );
}