// app/components/ContactSupport.tsx
"use client";

import { PhoneIcon } from '@heroicons/react/24/outline';

export default function ContactSupport() {
  const handleClick = () => {
    window.open('tel:0859387714', '_self');
  };

  return (
    <div className="fixed bottom-4 left-4 z-[10000]">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg shadow-lg transition-colors duration-200"
        title="พบปัญหาการใช้งาน ติดต่อทีม Support"
      >
        <PhoneIcon className="w-4 h-4" />
        <span className="hidden sm:inline">พบปัญหา ติดต่อ Support</span>
        <span className="font-medium">0859387714</span>
      </button>
    </div>
  );
}