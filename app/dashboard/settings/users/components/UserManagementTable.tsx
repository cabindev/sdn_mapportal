// app/dashboard/settings/users/components/UserManagementTable.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { FiSearch, FiArrowUp, FiArrowDown, FiInfo } from 'react-icons/fi';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลผู้ใช้ได้: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setError(error.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        toast.error(error.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ฟังก์ชันค้นหาผู้ใช้
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(sortUsers(users, sortField, sortDirection));
      return;
    }

    const filtered = users.filter(user => 
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(sortUsers(filtered, sortField, sortDirection));
  };

  // ฟังก์ชันเรียงลำดับ
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    setFilteredUsers(sortUsers(filteredUsers, field, newDirection));
  };

  // ฟังก์ชันสำหรับเรียงลำดับข้อมูล
  const sortUsers = (userList: User[], field: string, direction: 'asc' | 'desc') => {
    return [...userList].sort((a, b) => {
      let compareValueA: any = a[field as keyof User];
      let compareValueB: any = b[field as keyof User];
      
      if (field === 'firstName') {
        compareValueA = `${a.firstName} ${a.lastName}`;
        compareValueB = `${b.firstName} ${b.lastName}`;
      }
      
      if (typeof compareValueA === 'string' && typeof compareValueB === 'string') {
        return direction === 'asc' 
          ? compareValueA.localeCompare(compareValueB)
          : compareValueB.localeCompare(compareValueA);
      }
      
      // For dates or numbers
      return direction === 'asc' 
        ? compareValueA > compareValueB ? 1 : -1
        : compareValueB > compareValueA ? 1 : -1;
    });
  };

  // ฟังก์ชันเปลี่ยนสถานะผู้ใช้
  const toggleUserRole = async (userId: number, currentRole: string) => {
    // ป้องกันการเปลี่ยนสถานะตัวเอง (ถ้าเป็น ADMIN ไปเป็น MEMBER)
    if (userId === currentUserId && currentRole === 'ADMIN') {
      toast.error('ไม่สามารถลดสถานะของตัวเองได้');
      return;
    }
    
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้');
      }

      const updatedUser = await response.json();
      
      // อัปเดตรายการผู้ใช้
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? {...u, role: newRole} : u));
      setFilteredUsers(prevUsers => prevUsers.map(u => u.id === userId ? {...u, role: newRole} : u));
      
      toast.success(`เปลี่ยนสถานะผู้ใช้เป็น ${newRole === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'} สำเร็จ`);
    } catch (error: any) {
      console.error('Error toggling user role:', error);
      toast.error(error.message || 'ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้');
    }
  };

  // UI สำหรับส่วนหัวตารางที่มีการเรียงลำดับ
  const SortableHeader = ({ field, label }: { field: string, label: string }) => (
    <button 
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 group text-left"
    >
      <span>{label}</span>
      {sortField === field ? (
        sortDirection === 'asc' ? 
          <FiArrowUp className="w-4 h-4 text-orange-500" /> : 
          <FiArrowDown className="w-4 h-4 text-orange-500" />
      ) : (
        <div className="w-4 h-4 opacity-0 group-hover:opacity-30">
          <FiArrowDown className="w-4 h-4" />
        </div>
      )}
    </button>
  );

  // Custom Toggle Switch component
  const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full 
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${checked ? 'bg-orange-500' : 'bg-gray-300'}
        transition-colors duration-200 ease-in-out focus:outline-none
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      ></span>
    </button>
  );

  // UI สำหรับการ์ดในโหมดมือถือ
  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 transition-all hover:shadow-lg">
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0">
          {user.image ? (
            <div className="h-12 w-12 relative rounded-full overflow-hidden">
              <Image
                src={user.image}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="ml-4 flex-grow">
          <h3 className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {new Date(user.createdAt).toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
        
        {user.id === currentUserId && user.role === 'ADMIN' ? (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            ผู้ดูแลระบบปัจจุบัน
          </span>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {user.role === 'ADMIN' ? 'ผู้ดูแล' : 'สมาชิก'}
            </span>
            <ToggleSwitch 
              checked={user.role === 'ADMIN'} 
              onChange={() => toggleUserRole(user.id, user.role)} 
            />
          </div>
        )}
      </div>
    </div>
  );

  // สร้าง UI สำหรับแสดงสถานะโหลด
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="hidden md:block space-y-4">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="md:hidden space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium mb-2">เกิดข้อผิดพลาด</p>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="ค้นหาผู้ใช้ตามชื่อหรืออีเมล..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">ไม่พบข้อมูลผู้ใช้ในระบบ</p>
        </div>
      ) : (
        <>
          {/* แสดงตารางบนจอใหญ่ */}
          <div className="hidden md:block">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <SortableHeader field="firstName" label="ผู้ใช้" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <SortableHeader field="email" label="อีเมล" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <SortableHeader field="role" label="สถานะ" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <SortableHeader field="createdAt" label="วันที่สร้าง" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.image ? (
                                <div className="h-10 w-10 relative rounded-full overflow-hidden">
                                  <Image
                                    src={user.image}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.id === currentUserId && user.role === 'ADMIN' ? (
                            <div 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                              title="ไม่สามารถลดสถานะของตัวเองได้"
                            >
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-1.5"></span>
                              ผู้ดูแลระบบ (ตัวคุณ)
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <ToggleSwitch
                                checked={user.role === 'ADMIN'}
                                onChange={() => toggleUserRole(user.id, user.role)}
                              />
                              <span className="text-sm text-gray-600">
                                {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('th-TH', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* แสดงการ์ดบนจอมือถือ */}
          <div className="md:hidden">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </>
      )}

      {filteredUsers.length === 0 && users.length > 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
          <p className="text-gray-500">ไม่พบผู้ใช้ที่ตรงกับการค้นหา</p>
        </div>
      )}

      <div className="mt-6 bg-orange-50 border border-orange-100 rounded-lg p-4 text-sm text-orange-700 flex items-start">
        <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p className="font-medium mb-1">วิธีจัดการผู้ใช้:</p>
          <ul className="list-disc list-inside ml-1 space-y-1">
            <li>เลื่อนสวิตช์เพื่อเปลี่ยนสถานะผู้ใช้ระหว่าง "สมาชิก" และ "ผู้ดูแลระบบ"</li>
            <li>ไม่สามารถเปลี่ยนสถานะของตัวเองได้เพื่อความปลอดภัยของระบบ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}