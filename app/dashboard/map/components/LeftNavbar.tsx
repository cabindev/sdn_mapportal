// app/dashboard/map/components/LeftNavbar.tsx
"use client";

import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMap } from "react-leaflet";
import Link from "next/link";
import { 
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  TreePine,
  Home,
  Settings,
  FileText,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  Download
} from "lucide-react";
import { DocumentWithCategory } from "@/app/types/document";
import { getCategoryColor } from "@/app/utils/colorGenerator";
import { toast } from "react-hot-toast";

interface LeftNavbarProps {
  documents?: DocumentWithCategory[];
  categories?: any[];
  onHoverDocument?: (documentId: number | null) => void;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

export default function LeftNavbar({ 
  documents = [],
  categories = [],
  onHoverDocument,
  defaultCenter = [13.7563, 100.5018],
  defaultZoom = 6
}: LeftNavbarProps) {
  const { data: session, status } = useSession();
  const map = useMap();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    recent: false
  });
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialViewRef = useRef<{center: [number, number], zoom: number} | null>(null);

  // เก็บตำแหน่งและระดับซูมเริ่มต้นของแผนที่
  useState(() => {
    if (map) {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      
      initialViewRef.current = {
        center: [currentCenter.lat, currentCenter.lng] as [number, number],
        zoom: currentZoom
      };
    }
  });

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  // Get recent documents
  const recentDocuments = documents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // เมื่อเม้าส์ hover ที่เอกสาร - ดีเลย์การเลื่อนแผนที่เล็กน้อย
  const handleMouseEnter = (doc: DocumentWithCategory) => {
    setHoveredDocId(doc.id);
    if (onHoverDocument) {
      onHoverDocument(doc.id);
    }
    
    // ล้าง timer เดิมถ้ามี
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    // ตั้ง timer ใหม่เพื่อรอสักครู่ก่อนเลื่อนแผนที่
    hoverTimerRef.current = setTimeout(() => {
      if (map && doc.latitude && doc.longitude) {
        // เลื่อนแผนที่ไปยังตำแหน่งเอกสาร
        map.flyTo([doc.latitude, doc.longitude], 12, {
          animate: true,
          duration: 1
        });
      }
    }, 600); // รอ 600ms ก่อนเลื่อนแผนที่
  };
  
  // เมื่อเม้าส์ออกจากเอกสาร
  const handleMouseLeave = () => {
    setHoveredDocId(null);
    if (onHoverDocument) {
      onHoverDocument(null);
    }
    
    // ล้าง timer เมื่อเม้าส์ออก
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    
    // กลับไปที่มุมมองแผนที่เริ่มต้น
    if (map) {
      if (initialViewRef.current) {
        // ใช้ค่าที่เก็บไว้เมื่อโหลดหน้าครั้งแรก
        map.flyTo(
          initialViewRef.current.center, 
          initialViewRef.current.zoom, 
          { animate: true, duration: 1.5 }
        );
      } else {
        // ใช้ค่าเริ่มต้นที่กำหนดในพารามิเตอร์
        map.flyTo(defaultCenter, defaultZoom, { animate: true, duration: 1.5 });
      }
    }
  };

  // เมื่อคลิกที่เอกสาร - เลื่อนแผนที่และปิดเมนู
  const handleDocumentClick = (doc: DocumentWithCategory) => {
    if (map && doc.latitude && doc.longitude) {
      map.flyTo([doc.latitude, doc.longitude], 14, {
        animate: true,
        duration: 1.5
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-[9999] flex items-center justify-between">
        {/* Left Side - Menu Button & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-white/95 rounded-xl shadow-lg hover:bg-white transition-all duration-200 border border-gray-200"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700" />
            )}
          </button>

          {/* Logo */}
          <div className="bg-white/95 rounded-xl shadow-lg border border-gray-200 px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
                <TreePine className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">
                SDN Map Portal
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Section */}
        <div className="flex items-center gap-3">
          {/* Dashboard Button - Only for admins */}
          {status === "authenticated" && session?.user?.role === "ADMIN" && (
            <Link
              href="/dashboard"
              className="p-3 bg-white/95 rounded-xl shadow-lg hover:bg-white transition-all duration-200 border border-gray-200 hidden sm:block "
              title="จัดการระบบ"
            >
              <LayoutDashboard className="h-5 w-5 text-gray-700 " />
            </Link>
          )}

          {/* User Info & Auth Buttons */}
          {status === "authenticated" && session ? (
            <div className="flex items-center gap-2">
              {/* User Profile Card */}
              <div className="bg-white/95 rounded-xl shadow-lg border border-gray-200 px-4 py-2 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white overflow-hidden">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {session.user?.lastName?.[0] ||
                          session.user?.firstName?.[0] ||
                          "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.user?.firstName} {session.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user?.role === "ADMIN"
                        ? "ผู้ดูแลระบบ"
                        : "ผู้ใช้งาน"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="p-2 bg-white/95 rounded-xl shadow-lg hover:bg-white transition-all duration-200 border border-gray-200 ml-0 mr-8 hidden sm:inline-flex"
                title="ออกจากระบบ"
              >
                <LogOut className="h-5 w-5 text-red-700" />
              </button>
            </div>
          ) : (
            /* Show login buttons for unauthenticated users */
            <div className="flex items-center gap-2 mr-8">
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 px-4 py-2 bg-secondary/95 rounded-xl shadow-lg border border-border text-sm font-medium !text-secondary-foreground hover:bg-secondary transition-all duration-200"
              >
                <User className="w-4 h-4" />
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-primary !text-primary-foreground rounded-xl shadow-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/10"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute left-4 top-20 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-[calc(100vh-140px)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">SDN Map Portal</h3>
                  <p className="text-gray-200 text-sm">ระบบแผนที่เอกสาร</p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {/* Home Link */}
                <Link
                  href="/"
                  className="flex items-center px-3 py-3 text-sm rounded-lg transition-colors text-black hover:bg-gray-50 hover:text-black"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="mr-3 h-4 w-4" />
                  หน้าแรก
                </Link>

                {/* Dashboard Link - Only for admins */}
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-3 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    จัดการระบบ
                  </Link>
                )}

                {/* Recent Documents Section */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <button
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        recent: !prev.recent,
                      }))
                    }
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        เอกสารล่าสุด
                      </span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        {recentDocuments.length}
                      </span>
                    </div>
                    {expandedSections.recent ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {expandedSections.recent && (
                    <div className="mt-2 space-y-1 max-h-80 overflow-y-auto pr-2">
                      {recentDocuments.length > 0 ? (
                        recentDocuments.map((doc) => {
                          const isHovered = hoveredDocId === doc.id;

                          return (
                            <div
                              key={doc.id}
                              className={`p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                                isHovered ? "bg-gray-100" : ""
                              }`}
                              onMouseEnter={() => handleMouseEnter(doc)}
                              onMouseLeave={handleMouseLeave}
                              onClick={() => handleDocumentClick(doc)}
                            >
                              <div className="flex items-start gap-3">
                                {/* Document Image or Icon */}
                                {doc.coverImage ? (
                                  <div className="flex-shrink-0 w-12 h-9 rounded-md overflow-hidden shadow-sm">
                                    <img
                                      src={doc.coverImage}
                                      alt={doc.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                    {doc.title}
                                  </h4>

                                  {/* Category Badge */}
                                  <div className="flex items-center text-xs text-gray-500 mb-1">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs mr-2 bg-gray-100 text-gray-700">
                                      {doc.category?.name || "ไม่ระบุหมวดหมู่"}
                                    </span>
                                  </div>

                                  {/* Location */}
                                  <div className="flex items-center text-xs text-gray-500 mb-1">
                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                      {doc.district}, {doc.amphoe}
                                    </span>
                                  </div>

                                  {/* Date and Stats */}
                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span>{formatDate(doc.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center">
                                        <Eye className="w-3 h-3 mr-1" />
                                        <span>{doc.viewCount || 0}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Download className="w-3 h-3 mr-1" />
                                        <span>{doc.downloadCount || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 px-4 text-center text-gray-500">
                          <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">ไม่พบเอกสารล่าสุด</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Section - Only for authenticated users */}
                {status === "authenticated" && session && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white overflow-hidden mr-3">
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-medium">
                            {session.user?.lastName?.[0] ||
                              session.user?.firstName?.[0] ||
                              "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.firstName} {session.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        โปรไฟล์
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        ตั้งค่า
                      </Link>

                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}

                {/* Login Section for unauthenticated users */}
                {status === "unauthenticated" && (
                  <div className="border-t border-gray-100 pt-4 mt-4 pl-2">
                    <div className="space-y-2">
                      <Link
                        href="/auth/signin"
                        className="block w-full py-2 px-3 rounded-lg text-center text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        เข้าสู่ระบบ
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block w-full py-2 px-3 rounded-lg text-center bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        สมัครสมาชิก
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}