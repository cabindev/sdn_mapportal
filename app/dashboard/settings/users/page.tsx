// app/dashboard/settings/users/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import authOptions from '@/app/lib/configs/auth/authOptions';
import UserManagementTable from './components/UserManagementTable';

export default async function UsersSettingsPage() {
  // ตรวจสอบสิทธิ์การเข้าถึง
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/dashboard/settings/users');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl text-center font-bold text-gray-800 mb-6">จัดการผู้ใช้ระบบ</h1>
      <UserManagementTable />
    </div>
  );
}