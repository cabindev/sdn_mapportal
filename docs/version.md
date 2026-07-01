# SDN Map Portal - Version History

## v1.5.0 (2026-02-08)
**Add click-to-zoom province feature for both Leaflet and Google Maps**

### Changes
- คลิกพื้นที่ว่างบนแผนที่ (ไม่ใช่หมุด) จะซูมเข้าจังหวัดนั้นพร้อมแสดง polygon highlight
- รองรับทั้ง Leaflet map (`/dashboard/map`) และ Google Maps (`/google`)
- Sidebar เปลี่ยนเป็นแท็บเอกสาร พร้อมกรองเฉพาะเอกสารในจังหวัดที่เลือก
- เพิ่มขนาด marker ให้ใหญ่ขึ้น (16-28px) เพื่อให้คลิกง่ายขึ้น
- เปลี่ยน GeoJSON จาก remote URL เป็น local data เพื่อความเสถียรและรองรับ `name_th`
- Leaflet: สร้าง custom pane (`provinceOverlay`) ที่ `pointer-events: none` ป้องกัน polygon บดบัง marker
- Leaflet: ใช้ ray-casting point-in-polygon ตรวจจับจังหวัดจาก map click/mousemove

### Files Changed
- `app/dashboard/map/components/LeafletProvinceOverlay.tsx` - Rewrite: local GeoJSON, custom pane, map-level click/hover
- `app/google/components/GoogleProvinceOverlay.tsx` - Rewrite: local GeoJSON, click handler, region colors
- `app/google/components/GoogleMapView.tsx` - Wire `onSelectProvince` prop
- `app/dashboard/map/components/DynamicMapView.tsx` - CSS fix: remove focus outline
- `app/dashboard/map/components/MapMarker.tsx` - Larger markers, `bubblingMouseEvents={false}`
- `app/dashboard/map/components/LeftNavbar.tsx` - Province filter in sidebar
- `app/google/components/GoogleLeftNavbar.tsx` - Province filter in sidebar

---

## v1.4.0 (2026-02-06)
**Fix route and build issues**

### Changes
- แก้ไขปัญหา routing
- ใช้ local Prompt font แทน Google Fonts เพื่อแก้ build error

### Files Changed
- Route configuration fixes
- Font loading: local font instead of Google Fonts

---

## v1.3.0 (2026-02-06)
**Flatten project structure**

### Changes
- ย้ายไฟล์ทั้งหมดจาก `my-app/` มาที่ root directory
- ปรับโครงสร้างโปรเจกต์ให้เรียบง่ายขึ้น

---

## v1.2.0 (2026-02-06)
**Update map**

### Changes
- อัปเดตแผนที่และฟีเจอร์ต่างๆ

---

## v1.1.0 (2026-02-04)
**Add province/region selection with polygon highlight and redesign sidebar**

### Changes
- เพิ่มระบบเลือกจังหวัด/ภูมิภาคพร้อม polygon highlight
- ออกแบบ sidebar ใหม่
- เพิ่มระบบแสดงเวลา
- ลบ deploy workflow ที่ไม่ใช้แล้ว

---

## v1.0.0 (2026-01-29)
**Initial release**

### Features
- ระบบแผนที่แสดงเอกสาร SDN บน Leaflet และ Google Maps
- หมุดแสดงตำแหน่งเอกสารพร้อม popup รายละเอียด
- Sidebar แสดงรายการหมวดหมู่และเอกสาร
- ระบบค้นหาเอกสาร
- นับจำนวนการดูและดาวน์โหลด
- Province overlay แสดงขอบเขตจังหวัด
- Dashboard สำหรับจัดการเอกสาร
