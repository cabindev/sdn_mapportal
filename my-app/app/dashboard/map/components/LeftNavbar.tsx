"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMap } from "react-leaflet";
import Link from "next/link";
import {
  User, LogOut, FileText, MapPin, Clock, Eye, Download, ChevronRight, LayoutDashboard, Search, X, Layers
} from "lucide-react";
import { DocumentWithCategory } from "@/app/types/document";
import { toast } from "react-hot-toast";

// ข้อมูลภูมิภาคตาม regions.ts (10 ภูมิภาค, 77 จังหวัด)
const regionData: Record<string, { provinces: string[]; color: string }> = {
  "กรุงเทพมหานคร": {
    provinces: ["กรุงเทพมหานคร"],
    color: "#E91E63"
  },
  "เหนือบน": {
    provinces: ["เชียงใหม่", "เชียงราย", "ลำปาง", "ลำพูน", "แม่ฮ่องสอน", "น่าน", "พะเยา", "แพร่"],
    color: "#4CAF50"
  },
  "เหนือล่าง": {
    provinces: ["นครสวรรค์", "อุทัยธานี", "ชัยนาท", "กำแพงเพชร", "ตาก", "สุโขทัย", "พิษณุโลก", "พิจิตร", "เพชรบูรณ์", "อุตรดิตถ์"],
    color: "#8BC34A"
  },
  "อีสานบน": {
    provinces: ["ขอนแก่น", "อุดรธานี", "เลย", "หนองคาย", "หนองบัวลำภู", "บึงกาฬ", "นครพนม", "สกลนคร", "กาฬสินธุ์", "ร้อยเอ็ด", "มหาสารคาม"],
    color: "#FF9800"
  },
  "อีสานล่าง": {
    provinces: ["นครราชสีมา", "ชัยภูมิ", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ", "อุบลราชธานี", "ยโสธร", "อำนาจเจริญ", "มุกดาหาร"],
    color: "#FFC107"
  },
  "กลาง": {
    provinces: ["ลพบุรี", "สิงห์บุรี", "อ่างทอง", "พระนครศรีอยุธยา", "สระบุรี", "ปทุมธานี", "นนทบุรี", "นครนายก"],
    color: "#9C27B0"
  },
  "ตะวันออก": {
    provinces: ["สมุทรปราการ", "ฉะเชิงเทรา", "ปราจีนบุรี", "สระแก้ว", "จันทบุรี", "ตราด", "ระยอง", "ชลบุรี"],
    color: "#00BCD4"
  },
  "ตะวันตก": {
    provinces: ["สมุทรสงคราม", "สมุทรสาคร", "นครปฐม", "กาญจนบุรี", "ราชบุรี", "สุพรรณบุรี", "เพชรบุรี", "ประจวบคีรีขันธ์"],
    color: "#795548"
  },
  "ใต้บน": {
    provinces: ["ชุมพร", "ระนอง", "สุราษฎร์ธานี", "พังงา", "ภูเก็ต", "กระบี่", "นครศรีธรรมราช"],
    color: "#2196F3"
  },
  "ใต้ล่าง": {
    provinces: ["ตรัง", "พัทลุง", "สตูล", "สงขลา", "ปัตตานี", "ยะลา", "นราธิวาส"],
    color: "#3F51B5"
  }
};

interface LeftNavbarProps {
  documents?: DocumentWithCategory[];
  categories?: any[];
  onHoverDocument?: (documentId: number | null) => void;
  onClickDocument?: (document: DocumentWithCategory) => void;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  currentProvince?: string | null;
  onSelectProvince?: (provinceName: string, color: string) => void;
  onSelectRegion?: (regionName: string, provinces: string[], color: string) => void;
  highlightedProvince?: string | null;
  highlightedRegionName?: string | null;
}

export default function LeftNavbar({
  documents = [],
  categories = [],
  onHoverDocument,
  onClickDocument,
  defaultCenter = [13.7563, 100.5018],
  defaultZoom = 6,
  currentProvince = null,
  onSelectProvince,
  onSelectRegion,
  highlightedProvince = null,
  highlightedRegionName = null,
}: LeftNavbarProps) {
  const { data: session, status } = useSession();
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'provinces' | 'documents'>('provinces');
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  const [provinceSearch, setProvinceSearch] = useState("");
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialViewRef = useRef<{ center: [number, number]; zoom: number } | null>(null);

  useState(() => {
    if (map) {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      initialViewRef.current = {
        center: [currentCenter.lat, currentCenter.lng] as [number, number],
        zoom: currentZoom,
      };
    }
  });

  const activeProvince = highlightedProvince || currentProvince;

  useEffect(() => {
    if (activeProvince) {
      setIsOpen(true);
    }
  }, [activeProvince]);

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
    .slice(0, 10);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });

  const handleMouseEnter = (doc: DocumentWithCategory) => {
    setHoveredDocId(doc.id);
    onHoverDocument?.(doc.id);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      if (map && doc.latitude && doc.longitude) {
        map.flyTo([doc.latitude, doc.longitude], 12, { animate: true, duration: 1 });
      }
    }, 600);
  };

  const handleMouseLeave = () => {
    setHoveredDocId(null);
    onHoverDocument?.(null);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    if (highlightedProvince || highlightedRegionName) return;
    if (map) {
      if (initialViewRef.current) {
        map.flyTo(initialViewRef.current.center, initialViewRef.current.zoom, { animate: true, duration: 1.5 });
      } else {
        map.flyTo(defaultCenter, defaultZoom, { animate: true, duration: 1.5 });
      }
    }
  };

  const handleDocumentClick = (doc: DocumentWithCategory, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (map && doc.latitude && doc.longitude) {
      map.setView([doc.latitude, doc.longitude], 14, { animate: true });
    }
    if (onClickDocument) {
      onClickDocument(doc);
    }
  };

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  const handleProvinceClick = (provinceName: string, color: string) => {
    if (onSelectProvince) {
      onSelectProvince(provinceName, color);
    }
  };

  const handleRegionClick = (regionName: string, provinces: string[], color: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onSelectRegion) {
      onSelectRegion(regionName, provinces, color);
    }
  };

  const filteredRegionGroups = Object.entries(regionData).reduce((acc, [regionName, data]) => {
    const filtered = data.provinces.filter(p =>
      p.toLowerCase().includes(provinceSearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[regionName] = { ...data, provinces: filtered };
    }
    return acc;
  }, {} as Record<string, { provinces: string[]; color: string }>);

  return (
    <>
      {/* Toggle Button - Modern Floating Style */}
      <div className={`absolute top-8 z-[9999] transition-all duration-300 ${isOpen ? 'left-[410px]' : 'left-8'}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-lg border border-gray-100
            ${isOpen
              ? 'bg-white text-gray-700 hover:bg-gray-50'
              : 'bg-white text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Panel */}
      <div className={`
        absolute top-4 left-4 bottom-4 z-[9998]
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}
      `}>
        <div className="h-full w-[380px] bg-white shadow-2xl rounded-[32px] flex flex-col overflow-hidden border border-gray-100/50 font-prompt">

          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">SDN Map Portal</h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">ระบบแผนที่ข้อมูลเชิงพื้นที่</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pb-2">
            <div className="flex gap-1 p-1.5 bg-gray-50 rounded-2xl">
              <button
                onClick={() => setActiveTab('provinces')}
                className={`
                  flex-1 py-2.5 px-3 text-sm font-semibold rounded-xl transition-all
                  ${activeTab === 'provinces'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                จังหวัด
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`
                  flex-1 py-2.5 px-3 text-sm font-semibold rounded-xl transition-all
                  ${activeTab === 'documents'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                เอกสารล่าสุด
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* Provinces Tab */}
            {activeTab === 'provinces' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search */}
                <div className="px-6 py-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="ค้นหาจังหวัด..."
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 text-base bg-white border border-gray-100 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 placeholder:text-gray-400 transition-all"
                    />
                  </div>
                </div>

                {/* Region List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                  {Object.entries(filteredRegionGroups).map(([regionName, data]) => {
                    const isSelectedRegion = highlightedRegionName === regionName;
                    const isExpanded = expandedRegions[regionName];

                    return (
                      <div key={regionName} className="rounded-2xl overflow-hidden bg-white border border-gray-100 transition-all hover:shadow-md">
                        {/* Region Header */}
                        <div
                          className={`
                            flex items-center transition-all cursor-pointer select-none
                            ${isSelectedRegion
                              ? 'bg-gray-900 text-white'
                              : 'hover:bg-gray-50'
                            }
                          `}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleRegionClick(regionName, data.provinces, data.color, e)}
                            className="flex-1 flex items-center gap-4 px-4 py-4 text-left"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className={`text-base font-bold ${isSelectedRegion ? 'text-white' : 'text-gray-800'}`}>
                              {regionName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isSelectedRegion ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {data.provinces.length}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleRegion(regionName)}
                            className={`
                              p-3 mr-1 rounded-xl transition-colors
                              ${isSelectedRegion
                                ? 'hover:bg-white/10 text-white'
                                : 'hover:bg-gray-100 text-gray-400'
                              }
                            `}
                          >
                            <ChevronRight
                              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Province List */}
                        {isExpanded && (
                          <div className="px-2 pb-2 pt-1 bg-gray-50/50">
                            {data.provinces.map((province) => {
                              const isSelected = highlightedProvince === province;
                              return (
                                <button
                                  key={province}
                                  type="button"
                                  onClick={() => handleProvinceClick(province, data.color)}
                                  className={`
                                    w-full text-left px-4 py-3 text-[15px] rounded-xl transition-all my-0.5
                                    ${isSelected
                                      ? 'bg-orange-50 text-orange-700 font-bold shadow-sm ring-1 ring-orange-200'
                                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                    }
                                  `}
                                >
                                  {province}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {Object.keys(filteredRegionGroups).length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-base text-gray-400 font-medium">ไม่พบจังหวัดที่ค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {recentDocuments.length > 0 ? (
                  <>
                    {recentDocuments.map((doc) => {
                      const isHovered = hoveredDocId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          className={`
                            p-3 cursor-pointer transition-all rounded-2xl border
                            ${isHovered
                              ? 'bg-orange-50 border-orange-200 shadow-md transform scale-[1.02]'
                              : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                            }
                          `}
                          onMouseEnter={() => handleMouseEnter(doc)}
                          onMouseLeave={handleMouseLeave}
                          onClick={(event) => handleDocumentClick(doc, event)}
                        >
                          <div className="flex gap-4">
                            {/* Thumbnail */}
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                              {doc.coverImage ? (
                                <img
                                  src={doc.coverImage}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-gray-300" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className={`text-base font-bold line-clamp-2 ${isHovered ? 'text-orange-900' : 'text-gray-900'}`}>
                                {doc.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-xs px-2 py-0.5 rounded-md font-medium truncate ${isHovered ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {doc.amphoe}, {doc.province}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 font-medium">
                                <span>{formatDate(doc.createdAt)}</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  {doc.viewCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="text-base text-gray-400 font-medium">ไม่พบเอกสาร</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
            {status === "authenticated" && session ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {session.user?.firstName?.[0] || session.user?.lastName?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {session.user?.firstName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {session.user?.role === "ADMIN" ? "Admin" : "Member"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {session?.user?.role === "ADMIN" && (
                    <Link
                      href="/dashboard"
                      className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                      title="Dashboard"
                    >
                      <LayoutDashboard className="w-4.5 h-4.5 text-gray-600" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="p-2.5 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-xl transition-all"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4.5 h-4.5 text-gray-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/signin"
                  className="flex-1 py-2.5 text-center text-sm font-bold !text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-lg shadow-gray-200"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 py-2.5 text-center text-sm font-bold !text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-lg shadow-gray-200"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
