// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '../lib/configs/auth/authOptions';
import { DashboardProvider } from './context/DashboardContext';
import DashboardClient from './components/DashboardClient';

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
    <DashboardProvider>
      <DashboardClient user={session.user}>
        {children}
      </DashboardClient>
    </DashboardProvider>
  );
}