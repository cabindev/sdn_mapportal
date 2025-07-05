// app/dashboard/map/components/ClientMap.tsx
'use client'

import dynamic from 'next/dynamic'
import { CategoryDoc } from '@prisma/client'
import CircleLoader from './CircleLoader';


const DynamicMapWithNoSSR = dynamic(
  () => import('./DynamicMapView'),
  { 
    ssr: false,
    loading: () => (
      <CircleLoader
        variant="spinner" 
        size="48px" 
        thickness="4px" 
        color="#F97316" 
        message="กำลังโหลดแผนที่..." 
      />
    )
  }
)

interface ClientMapProps {
  categories: CategoryDoc[];
  simplified?: boolean;
}

export default function ClientMap({ categories, simplified = false }: ClientMapProps) {
  return <DynamicMapWithNoSSR categories={categories} simplified={simplified} />
}