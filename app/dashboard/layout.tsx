// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '../lib/configs/auth/authOptions';
import Sidebar from './Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 lg:ml-64"> {/* เพิ่ม margin left เท่ากับความกว้างของ sidebar */}
        <main>
          <div className="container mx-auto py-6 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}