// app/dashboard/map/components/StatsPanel.tsx
'use client'

import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { getCategoryColor } from '@/app/utils/colorGenerator'

interface StatsPanelProps {
 filteredDocuments: DocumentWithCategory[];
 sortedDocuments: DocumentWithCategory[];
 documents: DocumentWithCategory[];
 categories: CategoryDoc[];
 selectedCategories: number[];
}

export default function StatsPanel({ 
 filteredDocuments,
 sortedDocuments,
 documents,
 categories,
 selectedCategories
}: StatsPanelProps) {
 return (
   <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[400] max-w-[300px]">
     <div className="space-y-4">
       {/* สถิติ */}
       <div>
         <h4 className="font-medium mb-2 text-slate-900">สถิติเอกสาร</h4>
         <div className="space-y-1">
           <div className="text-sm text-slate-600">
             กำลังแสดง: <span className="font-medium text-slate-900">{filteredDocuments.length} / {documents.length} รายการ</span>
           </div>
           {categories.map(cat => {
             const count = documents.filter(d => d.categoryId === cat.id).length;
             const colorScheme = getCategoryColor(cat.id);
             return (
               <div key={cat.id} className="text-sm text-slate-600 flex items-center">
                 <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colorScheme.primary }}></span>
                 {cat.name}: <span className="ml-1 font-medium text-slate-900">{count} รายการ</span>
               </div>
             );
           })}
         </div>
       </div>
       
       {/* อัพเดทล่าสุด */}
       {sortedDocuments.length > 0 && (
         <div className="pt-3 border-t border-slate-200">
           <h4 className="font-medium mb-2 text-slate-900">อัพเดทล่าสุด</h4>
           <div className="space-y-2">
             {sortedDocuments.slice(0, 3).map(doc => (
               <div key={doc.id} className="text-sm bg-slate-50 p-2 rounded">
                 <div className="font-medium text-slate-700 line-clamp-1">{doc.title}</div>
                 <div className="text-xs text-slate-500 mt-1">
                   {formatDistanceToNow(new Date(doc.createdAt), {
                     addSuffix: true,
                     locale: th
                   })}
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   </div>
 );
}
