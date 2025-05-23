ระบบแผนที่เอกสารดิจิทัลประเทศไทย
ระบบนี้พัฒนาขึ้นเพื่อจัดเก็บและแสดงเอกสารดิจิทัลในรูปแบบแผนที่ ทำให้สามารถเข้าถึงข้อมูลเอกสารตามภูมิศาสตร์ได้อย่างมีประสิทธิภาพ
คุณสมบัติหลัก

แผนที่แบบอินเทอร์แอคทีฟ - แสดงตำแหน่งเอกสารบนแผนที่ประเทศไทย
การกรองตามหมวดหมู่ - กรองเอกสารตามประเภทหมวดหมู่ที่ต้องการ
สถิติเอกสาร - แสดงข้อมูลเชิงสถิติเกี่ยวกับเอกสารในระบบ
การค้นหาตำแหน่ง - ค้นหาตำบล อำเภอ จังหวัดบนแผนที่
การเพิ่มเอกสารบนแผนที่ - คลิกที่แผนที่เพื่อเพิ่มเอกสารใหม่

โครงสร้างคอมโพเนนต์
ระบบประกอบด้วยคอมโพเนนต์หลักดังนี้:
ส่วนแผนที่

DynamicMapView - คอมโพเนนต์หลักสำหรับแสดงแผนที่และจัดการข้อมูล
MapMarker - แสดงเอกสารบนแผนที่ด้วยหมุดสี
RecentDocumentsSidebar - แสดงเอกสารล่าสุดที่ด้านข้างแผนที่

ส่วนกรองและนำทาง

MapHeader, MapFooter - ส่วนควบคุมด้านบนและล่างของแผนที่
CategoryFilter - ตัวกรองตามหมวดหมู่เอกสาร
MapTabNavigation - แท็บสำหรับสลับระหว่างมุมมองต่างๆ

ส่วนข้อมูลและสถิติ

CategoriesTab, StatsTab, DocumentsTab - แท็บแสดงข้อมูลเอกสาร
RegionalStats - สถิติตามภูมิภาค

การเริ่มต้นใช้งาน

Clone โปรเจคนี้ลงในเครื่อง
ติดตั้ง dependencies:

bashCopynpm install
# หรือ
yarn install

เริ่มเซิร์ฟเวอร์สำหรับพัฒนา:

bashCopynpm run dev
# หรือ
yarn dev

เปิดเบราว์เซอร์ที่ http://localhost:3000

โครงสร้างไฟล์
app/
├── components/           # คอมโพเนนต์ที่ใช้ร่วมกัน
├── dashboard/
│   ├── map/             # หน้าหลักของแผนที่
│   │   ├── components/  # คอมโพเนนต์ย่อยของแผนที่
│   │   └── page.tsx     # หน้าหลักแผนที่
│   └── documents/       # หน้าจัดการเอกสาร
├── lib/                 # ฟังก์ชันและตัวช่วย
├── types/               # Type definitions
├── utils/               # Utility functions
└── page.tsx             # หน้าแรกของแอปพลิเคชัน
เทคโนโลยีที่ใช้

Next.js - React framework
React Leaflet - สำหรับแสดงแผนที่แบบอินเทอร์แอคทีฟ
Tailwind CSS - สำหรับสไตลิ่ง
Prisma - สำหรับจัดการฐานข้อมูล
React Icons - สำหรับไอคอน

การนำไปใช้
ระบบนี้สามารถนำไปประยุกต์ใช้กับหน่วยงานต่างๆ ที่ต้องการแสดงข้อมูลเอกสารในรูปแบบแผนที่ เช่น:

หน่วยงานราชการที่ต้องการแสดงเอกสารราชการตามพื้นที่
องค์กรที่ต้องการจัดเก็บข้อมูลภูมิศาสตร์หรือข้อมูลเชิงพื้นที่
ระบบจัดการเอกสารที่ต้องการมิติด้านพื้นที่เพิ่มเติม

การขยายเพิ่มเติม
ระบบสามารถขยายเพิ่มเติมได้ เช่น:

เพิ่มระบบค้นหาเอกสารแบบขั้นสูง
เพิ่มการวิเคราะห์ข้อมูลและสถิติเชิงพื้นที่
เพิ่มระบบแจ้งเตือนเมื่อมีเอกสารใหม่ในพื้นที่สนใจ




<!-- รายละเอียดคอมโพเนนต์ในโปรเจค -->
นี่คือคำอธิบายหน้าที่ของแต่ละคอมโพเนนต์ในไดเรกทอรี components:
การแสดงผลแผนที่และองค์ประกอบหลัก

DynamicMapView.tsx - คอมโพเนนต์หลักของแผนที่ ใช้ Leaflet เพื่อแสดงแผนที่และจัดการกับมาร์กเกอร์ต่างๆ รองรับการกรองตามหมวดหมู่
ClientMap.tsx - คอมโพเนนต์ Client-side wrapper สำหรับแผนที่ ช่วยในการโหลดแผนที่แบบ lazy load เพื่อหลีกเลี่ยงปัญหา SSR
MapMarker.tsx - คอมโพเนนต์สำหรับแสดงจุดบนแผนที่ แสดงเอกสารแต่ละรายการด้วยสีตามหมวดหมู่ และรองรับการคลิกเพื่อแสดงรายละเอียด
ProvinceMarkers.tsx - แสดงจุดหมุดสำหรับจังหวัดต่างๆ บนแผนที่ มักจะแสดงเมื่อซูมออกในระดับที่กำหนด
LocationMarker.tsx - คอมโพเนนต์สำหรับแสดงและจัดการตำแหน่งที่ผู้ใช้เลือกบนแผนที่ ใช้สำหรับการเพิ่มเอกสารใหม่
RegionLayer.tsx - แสดงชั้นข้อมูลตามภูมิภาคของประเทศบนแผนที่ เช่น เขตภาคเหนือ ภาคอีสาน ฯลฯ

ส่วนควบคุมและการนำทาง

MapHeader.tsx - ส่วนหัวของแผนที่ แสดงชื่อและตัวควบคุมพื้นฐาน เช่น จำนวนเอกสาร ปุ่มค้นหา
MapFooter.tsx - ส่วนล่างของแผนที่ ประกอบด้วยแท็บต่างๆ สำหรับแสดงข้อมูลเพิ่มเติม
MapTabNavigation.tsx - การนำทางด้วยแท็บในส่วนล่างของแผนที่ เช่น แท็บหมวดหมู่ คำอธิบาย สถิติ และเอกสาร
TambonSearch.tsx - คอมโพเนนต์สำหรับค้นหาตำบล/อำเภอ/จังหวัด และเลื่อนแผนที่ไปยังตำแหน่งที่ค้นหา

แท็บและเนื้อหา

CategoriesTab.tsx - แท็บแสดงหมวดหมู่เอกสารทั้งหมด ให้ผู้ใช้เลือกกรองตามหมวดหมู่
LegendTab.tsx - แท็บแสดงคำอธิบายสัญลักษณ์และสีต่างๆ บนแผนที่
StatsTab.tsx - แท็บแสดงสถิติเกี่ยวกับเอกสาร เช่น จำนวนเอกสารแยกตามหมวดหมู่หรือพื้นที่
DocumentsTab.tsx - แท็บแสดงรายการเอกสารล่าสุดหรือเอกสารที่กรองแล้ว

สถิติและข้อมูล

RegionalStats.tsx - แสดงสถิติเอกสารแยกตามภูมิภาค
StatsPanel.tsx - แผงแสดงสถิติทั่วไปเกี่ยวกับเอกสารในระบบ
RecentDocumentsSidebar.tsx - แถบด้านข้างแสดงเอกสารล่าสุด มักจะอยู่ด้านซ้ายหรือขวาของแผนที่

คำอธิบายและตัวกรอง

Legend.tsx - คอมโพเนนต์แสดงคำอธิบายสัญลักษณ์บนแผนที่
ZoneLegend.tsx - คำอธิบายเกี่ยวกับโซนหรือพื้นที่พิเศษบนแผนที่
CategoryFilter.tsx - คอมโพเนนต์ตัวกรองตามหมวดหมู่เอกสาร

ฟอร์มและการแสดงข้อมูล

DocumentForm.tsx - ฟอร์มสำหรับเพิ่มหรือแก้ไขเอกสาร เปิดเมื่อคลิกที่แผนที่หรือเมื่อต้องการแก้ไขเอกสาร
DocumentPopup.tsx - ป๊อปอัพแสดงรายละเอียดเอกสารเมื่อคลิกที่หมุดบนแผนที่

อื่นๆ

CircleLoader.tsx - คอมโพเนนต์แสดงสถานะกำลังโหลด มักใช้ระหว่างการโหลดแผนที่หรือข้อมูล

การจัดการและแบ่งแยกคอมโพเนนต์ในลักษณะนี้ช่วยให้โค้ดมีความเป็นระเบียบและง่ายต่อการบำรุงรักษา โดยแต่ละคอมโพเนนต์มีหน้าที่ชัดเจนและสามารถทำงานร่วมกันเพื่อสร้างระบบแผนที่เอกสารที่สมบูรณ์