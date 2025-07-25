// app/google/components/GoogleLeftNavbar.tsx
"use client";

import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User, LogOut, FileText, MapPin, Clock, Eye, Download, Layers, ChevronDown, ChevronUp, LayoutDashboard
} from "lucide-react";
import { DocumentWithCategory } from "@/app/types/document";
import { toast } from "react-hot-toast";

interface GoogleLeftNavbarProps {
  documents?: DocumentWithCategory[];
  categories?: any[];
  onHoverDocument?: (documentId: number | null) => void;
  onClickDocument?: (document: DocumentWithCategory) => void;
  onFlyTo?: (lat: number, lng: number, zoom?: number) => void;
}

export default function GoogleLeftNavbar({
  documents = [],
  categories = [],
  onHoverDocument,
  onClickDocument,
  onFlyTo,
}: GoogleLeftNavbarProps) {
  const { data: session, status } = useSession();
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ documents: false });
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      window.location.href = "/";
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  const recentDocuments = documents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Hover docs
  const handleMouseEnter = (doc: DocumentWithCategory) => {
    setHoveredDocId(doc.id);
    onHoverDocument?.(doc.id);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      if (onFlyTo && doc.latitude && doc.longitude) {
        onFlyTo(doc.latitude, doc.longitude, 12);
      }
    }, 600);
  };

  const handleMouseLeave = () => {
    setHoveredDocId(null);
    onHoverDocument?.(null);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    // กลับไปยังตำแหน่งเริ่มต้น
    if (onFlyTo) {
      onFlyTo(13.0, 100.5, 6);
    }
  };

  const handleDocumentClick = (doc: DocumentWithCategory, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // ย้ายแผนที่ไปยังตำแหน่งเอกสาร
    if (onFlyTo && doc.latitude && doc.longitude) {
      onFlyTo(doc.latitude, doc.longitude, 14);
    }
    
    // แสดง DocumentPopup
    if (onClickDocument) {
      onClickDocument(doc);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <>
      {/* Control Panel Toggle Button */}
<div className="absolute top-16 left-4 z-[9999]">
        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className="p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-200"
          title="ชั้นข้อมูลเพื่อดูเนื้อหา"
        >
          <Layers className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Floating Control Panel */}
      {isControlsOpen && (
        <div className="absolute top-16 left-20 z-[9999] w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-[calc(100vh-32px)]">
          {/* Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-gray-700" />
              <h3 className="text-gray-800 font-medium">ชั้นข้อมูลเชิงพื้นที่</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              พื้นที่ : ผลสำเร็จ
            </p>
          </div>

          {/* Controls */}
          <div className="p-4 space-y-3">
            {/* Display Options */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="display1" className="mr-2 accent-gray-800" defaultChecked />
                <label htmlFor="display1" className="text-sm text-gray-800">แสดงกล่องข้อมูล</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="display2" className="mr-2 accent-gray-800" defaultChecked />
                <label htmlFor="display2" className="text-sm text-gray-800">แสดงแผนผังพื้นที่</label>
              </div>
            </div>

            {/* Recent Documents Section */}
            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-800" />
                  <span className="text-sm font-medium text-gray-800">เอกสารล่าสุด</span>
                  <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full">
                    {recentDocuments.length}
                  </span>
                </div>
                <div className="p-1 rounded group-hover:bg-gray-200 transition-colors">
                  {expandedSections.documents ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {expandedSections.documents && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-2">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc) => {
                      const isHovered = hoveredDocId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          className={`p-3 hover:bg-white rounded-lg cursor-pointer transition-all duration-200 ${
                            isHovered ? "bg-white shadow-sm" : ""
                          }`}
                          onMouseEnter={() => handleMouseEnter(doc)}
                          onMouseLeave={handleMouseLeave}
                          onClick={(event) => handleDocumentClick(doc, event)}
                        >
                          <div className="flex items-start gap-3">
                            {doc.coverImage ? (
                              <div className="flex-shrink-0 w-12 h-9 rounded overflow-hidden shadow-sm">
                                <img
                                  src={doc.coverImage}
                                  alt={doc.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-gray-200">
                                <FileText className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                {doc.title}
                              </h4>
                              
                              <div className="flex items-center text-xs text-gray-600 mb-1">
                                <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                                  {doc.category?.name || "ไม่ระบุหมวดหมู่"}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500 mb-1">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {doc.district}, {doc.amphoe}
                                </span>
                              </div>
                              
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
                              
                              {/* Hint สำหรับการใช้งาน */}
                              <div className="text-xs text-blue-600 mt-1 italic opacity-75">
                                คลิกเพื่อดูรายละเอียดเอกสาร
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 px-4 text-center text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">ไม่พบเอกสารล่าสุด</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dashboard Link */}
            {session?.user?.role === "ADMIN" && (
              <div className="border-t border-gray-200 pt-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">จัดการระบบ</span>
                </Link>
              </div>
            )}

            {/* Auth Section */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">บัญชีผู้ใช้</span>
              </div>

              {status === "authenticated" && session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white overflow-hidden">
                      {session.user?.image ? (
                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-medium">
                          {session.user?.lastName?.[0] || session.user?.firstName?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {session.user?.firstName} {session.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block w-full py-2 px-3 rounded-lg text-center text-sm !text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors hover:!text-gray-800"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full py-2 px-3 rounded-lg text-center text-sm bg-gray-800 !text-white hover:bg-gray-700 transition-colors hover:!text-white"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}