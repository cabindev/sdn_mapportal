// app/google/page.tsx
import { getPublishedDocuments } from '@/app/lib/actions/documents/get'
import GoogleMapClient from './components/GoogleMapClient'
import RecentUpdateWrapper from '../components/RecentUpdateWrapper'

export default async function GoogleMapsPage() {
  const documents = await getPublishedDocuments()

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Full Screen Map */}
      <div className="fixed inset-0">
        <GoogleMapClient documents={documents} fullscreen={true} />
      </div>

      {/* Recent Update Notification */}
      <RecentUpdateWrapper documents={documents} />
    </main>
  )
}