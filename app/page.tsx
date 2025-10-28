// app/page.tsx
import React from "react";
import { getCategories } from '@/app/lib/actions/categories/get';
import { getPublishedDocuments } from '@/app/lib/actions/documents/get';
import MapFilterWrapper from './components/MapFilterWrapper';
import ContactSupport from './components/ContactSupport';
import RecentUpdateWrapper from './components/RecentUpdateWrapper';

export default async function HomePage() {
  const [categories, documents] = await Promise.all([
    getCategories(),
    getPublishedDocuments()
  ]);

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Full Screen Map */}
      <div className="fixed inset-0">
        <MapFilterWrapper
          categories={categories}
          documents={documents}
          fullscreen={true}
          showTitle={false}
          simplified={false}
        />
      </div>

      {/* Contact Support Button */}
      {/* <ContactSupport /> */}

      {/* Recent Update Notification */}
      <RecentUpdateWrapper documents={documents} />
    </main>
  );
}