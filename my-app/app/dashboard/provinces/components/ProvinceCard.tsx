import Link from 'next/link'
import { MapPinIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface ProvinceCardProps {
  name: string
  documentCount: number
  totalDocuments?: number
  publishedDocuments?: number
}

export default function ProvinceCard({ 
  name, 
  documentCount, 
  totalDocuments, 
  publishedDocuments 
}: ProvinceCardProps) {
  return (
    <Link 
      href={`/dashboard/provinces/${encodeURIComponent(name)}`}
      className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <MapPinIcon className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold ml-3 text-gray-800">{name}</h2>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <DocumentTextIcon className="w-5 h-5 mr-2" />
          <p>{documentCount} เอกสาร</p>
        </div>
        
        {publishedDocuments !== undefined && (
          <div className="flex items-center text-green-600 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <p>{publishedDocuments} เผยแพร่แล้ว</p>
          </div>
        )}
        
        {totalDocuments !== undefined && totalDocuments > 0 && publishedDocuments !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(publishedDocuments / totalDocuments) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
    </Link>
  )
}