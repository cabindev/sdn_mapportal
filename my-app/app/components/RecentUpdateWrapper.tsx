// app/components/RecentUpdateWrapper.tsx
"use client";

import dynamic from 'next/dynamic';
import { DocumentWithCategory } from '@/app/types/document';

const RecentUpdateNotification = dynamic(
  () => import('../dashboard/map/components/RecentUpdateNotification'),
  { ssr: false }
);

interface RecentUpdateWrapperProps {
  documents: DocumentWithCategory[];
}

export default function RecentUpdateWrapper({ documents }: RecentUpdateWrapperProps) {
  return <RecentUpdateNotification documents={documents} />;
}
