# SDN Map Portal - API Documentation

> Base URL (Production): `https://sdnmapportal.sdnthailand.com`
> Base URL (Local): `http://localhost:3000`

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.1.7 |
| Runtime | React | 19.0.0 |
| Language | TypeScript | 5.7.3 |
| Database | MySQL + Prisma ORM | 6.10.1 |
| Auth | NextAuth.js | 4.24.11 |
| Map (Leaflet) | react-leaflet + Leaflet | 5.0.0 / 1.9.4 |
| Map (Google) | @react-google-maps/api | 2.20.6 |
| Charts | ECharts | 5.6.0 |
| Styling | Tailwind CSS | 3.x |
| GeoJSON | thailand.json (77 provinces) | local |
| Geocoding | GISTDA Sphere API | - |
| Icons | Lucide React | - |

---

## Environment Variables

```env
# Database
DATABASE_URL="mysql://user:pass@host:3306/sdn_mapportal"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://sdnmapportal.sdnthailand.com"

# Email (Password Reset - Gmail SMTP)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="gmail-app-password"

# GISTDA Sphere API (Reverse Geocoding)
NEXT_PUBLIC_GISTDA_API_KEY="your-gistda-api-key"
GISTDA_API_BASE_URL="https://api.sphere.gistda.or.th"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

---

## Data Models

### Document

```json
{
  "id": 1,
  "title": "ชื่อเอกสาร",
  "description": "รายละเอียด",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "หมวดหมู่",
    "description": "รายละเอียดหมวดหมู่"
  },
  "filePath": "/uploads/documents/file.pdf",
  "coverImage": "/uploads/covers/image.jpg",
  "province": "เชียงใหม่",
  "amphoe": "เมืองเชียงใหม่",
  "district": "ศรีภูมิ",
  "latitude": 18.7883,
  "longitude": 98.9853,
  "year": 2567,
  "viewCount": 42,
  "downloadCount": 15,
  "isPublished": true,
  "userId": 1,
  "user": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "email": "user@example.com",
    "role": "ADMIN"
  },
  "createdAt": "2025-01-15T08:30:00.000Z",
  "updatedAt": "2025-01-15T08:30:00.000Z"
}
```

### CategoryDoc

```json
{
  "id": 1,
  "name": "งานวิจัย",
  "description": "เอกสารงานวิจัย",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "_count": { "documents": 12 }
}
```

### User

```json
{
  "id": 1,
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "email": "user@example.com",
  "role": "ADMIN",
  "image": "/uploads/profiles/avatar.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### LocationData

```json
{
  "lat": 18.7883,
  "lng": 98.9853,
  "province": "เชียงใหม่",
  "amphoe": "เมืองเชียงใหม่",
  "district": "ศรีภูมิ",
  "geocode": 500101,
  "zone": "เหนือบน"
}
```

---

## API Endpoints

---

### 1. Documents - Get Counts

ดึงจำนวนการดูและดาวน์โหลดของเอกสาร

```
GET /api/documents/{id}
```

**Postman:**
```
GET https://sdnmapportal.sdnthailand.com/api/documents/1
```

**Response 200:**
```json
{
  "id": 1,
  "viewCount": 42,
  "downloadCount": 15
}
```

**Response 404:**
```json
{ "error": "ไม่พบเอกสาร" }
```

---

### 2. Documents - Increment View

เพิ่มจำนวนการดู +1

```
POST /api/documents/view/{id}
```

**Postman:**
```
POST https://sdnmapportal.sdnthailand.com/api/documents/view/1
```

**Response 200:**
```json
{
  "success": true,
  "viewCount": 43
}
```

---

### 3. Documents - Increment Download

เพิ่มจำนวนการดาวน์โหลด +1

```
POST /api/documents/download/{id}
```

**Postman:**
```
POST https://sdnmapportal.sdnthailand.com/api/documents/download/1
```

**Response 200:**
```json
{
  "success": true,
  "downloadCount": 16
}
```

---

### 4. Reverse Geocode

แปลงพิกัด lat/lng เป็นชื่อจังหวัด (ผ่าน GISTDA API)

```
GET /api/reverse-geocode?lat={lat}&lng={lng}
```

**Postman:**
```
GET https://sdnmapportal.sdnthailand.com/api/reverse-geocode?lat=18.7883&lng=98.9853
```

**Response 200:**
```json
{
  "province": "เชียงใหม่",
  "raw": { ... }
}
```

---

### 5. GISTDA Reverse Geocode (Direct Proxy)

เรียก GISTDA API ตรง

```
GET /api/gistda/reverse-geocode?lat={lat}&lng={lng}
```

**Postman:**
```
GET https://sdnmapportal.sdnthailand.com/api/gistda/reverse-geocode?lat=18.7883&lng=98.9853
```

**Response 200:**
```json
{
  "features": [
    {
      "properties": {
        "province_t": "เชียงใหม่",
        "amphoe_t": "เมืองเชียงใหม่",
        "tambon_t": "ศรีภูมิ",
        "geocode": 500101
      }
    }
  ]
}
```

---

### 6. Google Maps API Key

ดึง Google Maps API Key สำหรับ frontend

```
GET /api/google-maps
```

**Postman:**
```
GET https://sdnmapportal.sdnthailand.com/api/google-maps
```

**Response 200:**
```json
{
  "apiKey": "AIza..."
}
```

---

### 7. Auth - Sign Up

สมัครสมาชิก

```
POST /api/auth/signup
Content-Type: multipart/form-data
```

**Postman:**
```
POST https://sdnmapportal.sdnthailand.com/api/auth/signup

Body (form-data):
  firstName: "สมชาย"
  lastName: "ใจดี"
  email: "user@example.com"
  password: "12345"
  image: (file, optional)
```

**Response 200:**
```json
{
  "message": "ลงทะเบียนสำเร็จ",
  "userId": 1
}
```

---

### 8. Auth - Sign In (NextAuth)

เข้าสู่ระบบ

```
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded
```

**Postman:**
```
POST https://sdnmapportal.sdnthailand.com/api/auth/callback/credentials

Body (x-www-form-urlencoded):
  email: "user@example.com"
  password: "12345"
  csrfToken: (from GET /api/auth/csrf)
```

---

### 9. Auth - Get Session

ดึงข้อมูล session ปัจจุบัน

```
GET /api/auth/session
```

**Postman:**
```
GET https://sdnmapportal.sdnthailand.com/api/auth/session
```

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "email": "user@example.com",
    "role": "ADMIN",
    "image": "/uploads/profiles/avatar.jpg"
  },
  "expires": "2025-03-01T00:00:00.000Z"
}
```

---

### 10. Auth - Forgot Password

ส่ง email reset password

```
POST /api/auth/forgot-password
Content-Type: application/json
```

**Postman:**
```
POST https://sdnmapportal.sdnthailand.com/api/auth/forgot-password

Body (JSON):
{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "message": "ลิงก์สำหรับรีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว"
}
```

---

### 11. Auth - Reset Password

รีเซ็ตรหัสผ่านด้วย token

```
POST /api/auth/reset-password
Content-Type: application/json
```

**Postman:**
```
POST https://sdnmapportal.sdnthailand.com/api/auth/reset-password

Body (JSON):
{
  "token": "hex_token_string",
  "password": "new_password"
}
```

---

### 12. Users - List All (Admin)

ดึงรายชื่อ user ทั้งหมด (ต้องเป็น Admin)

```
GET /api/users
Authorization: Session Cookie
```

**Postman:**
```
GET https://sdnmapportal.sdnthailand.com/api/users
```

**Response 200:**
```json
[
  {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "email": "user@example.com",
    "role": "ADMIN",
    "image": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 13. Users - Get/Update/Delete (Admin)

```
GET    /api/users/{id}
PUT    /api/users/{id}    Body: { "role": "ADMIN" | "MEMBER" }
DELETE /api/users/{id}
```

**Postman:**
```
GET https://sdnmapportal.sdnthailand.com/api/users/1
PUT https://sdnmapportal.sdnthailand.com/api/users/1
DELETE https://sdnmapportal.sdnthailand.com/api/users/1
```

---

## Server Actions (Internal)

เป็น Next.js Server Actions ที่เรียกใช้ภายในแอป ไม่สามารถเรียกจาก Postman ได้โดยตรง

| Function | Path | Description |
|----------|------|-------------|
| `getDocuments()` | `lib/actions/documents/get` | ดึงเอกสารทั้งหมด (cached 60s) |
| `getPublishedDocuments()` | `lib/actions/documents/get` | ดึงเอกสารที่เผยแพร่แล้ว |
| `getDocumentById(id)` | `lib/actions/documents/get` | ดึงเอกสารตาม ID |
| `getPublishedDocumentsByProvince(province)` | `lib/actions/documents/get` | ดึงเอกสารตามจังหวัด |
| `searchDocuments({search, categoryId, page, limit})` | `lib/actions/documents/search` | ค้นหาเอกสาร |
| `createDocument(formData)` | `lib/actions/documents/create` | สร้างเอกสาร |
| `updateDocument(id, formData)` | `lib/actions/documents/update` | อัปเดตเอกสาร |
| `deleteDocument(id)` | `lib/actions/documents/delete` | ลบเอกสาร |
| `getCategories()` | `lib/actions/categories/get` | ดึงหมวดหมู่ทั้งหมด |
| `getDashboardStatistics()` | `lib/actions/statistics/get` | สถิติ Dashboard |
| `getProvincesWithStats()` | `lib/actions/statistics/provinces` | สถิติจังหวัด |

---

## Map Components Architecture

### Leaflet Map (หน้าหลัก `/` และ `/dashboard/map`)

```
DynamicMapView
├── MapContainer (react-leaflet)
│   ├── TileLayer (OpenStreetMap)
│   ├── ProvinceMarkers (จุดจังหวัด, zoom >= 7)
│   ├── LeafletProvinceOverlay (hover polygon จังหวัด)
│   ├── ProvinceHighlight (polygon highlight เมื่อเลือก)
│   ├── MapMarker[] (markers เอกสาร)
│   ├── LocationMarker (เลือกตำแหน่ง)
│   ├── SearchLocationMarker
│   ├── CurrentLocationMarker
│   ├── ProvinceCircleOverlay
│   └── ZoomControl
├── LeftNavbar (sidebar จังหวัด/เอกสาร)
├── RightSidebar (filter หมวดหมู่)
├── Province Info Card
├── DocumentPopup
└── RecentUpdateNotification
```

### Google Map (หน้า `/google`)

```
GoogleMapView
├── GoogleMap (@react-google-maps/api)
│   ├── Marker[] (เอกสาร)
│   ├── InfoWindow + GoogleDocumentPopup
│   ├── GoogleProvinceOverlay (hover)
│   ├── GoogleProvinceHighlight (polygon highlight)
│   └── GoogleProvinceCircleOverlay
├── GoogleLeftNavbar (sidebar)
├── GoogleRightSidebar
└── Province Info Card
```

---

## Map Configuration

### Leaflet Settings

```typescript
const THAILAND_BOUNDS = {
  center: [13.736717, 100.523186],   // กรุงเทพฯ
  zoom: 6,
  minZoom: 5,
  maxZoom: 18,
  bounds: [
    [4.0, 94.0],    // Southwest
    [22.0, 109.0],  // Northeast
  ]
};
```

### GeoJSON Data

ใช้ `app/data/thailand.json` - GeoJSON FeatureCollection 77 จังหวัด

```typescript
// Feature properties
{
  "name": "Chiang Mai",     // ชื่ออังกฤษ
  "name_th": "เชียงใหม่"    // ชื่อไทย
}
```

### 10 Regions (Health Zones)

| Region | Provinces | Color |
|--------|-----------|-------|
| กรุงเทพมหานคร | 1 | #E91E63 |
| เหนือบน | 8 | #4CAF50 |
| เหนือล่าง | 10 | #8BC34A |
| อีสานบน | 11 | #FF9800 |
| อีสานล่าง | 9 | #FFC107 |
| กลาง | 8 | #9C27B0 |
| ตะวันออก | 8 | #00BCD4 |
| ตะวันตก | 8 | #795548 |
| ใต้บน | 7 | #2196F3 |
| ใต้ล่าง | 7 | #3F51B5 |

---

## Postman Quick Test Links

ทดสอบ API ได้ทันทีโดยนำ URL ไปวางใน Postman:

### Public APIs (ไม่ต้อง auth)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `https://sdnmapportal.sdnthailand.com/api/documents/1` | ดูจำนวน view/download |
| `POST` | `https://sdnmapportal.sdnthailand.com/api/documents/view/1` | เพิ่ม view +1 |
| `POST` | `https://sdnmapportal.sdnthailand.com/api/documents/download/1` | เพิ่ม download +1 |
| `GET` | `https://sdnmapportal.sdnthailand.com/api/reverse-geocode?lat=18.7883&lng=98.9853` | Reverse geocode |
| `GET` | `https://sdnmapportal.sdnthailand.com/api/gistda/reverse-geocode?lat=13.75&lng=100.52` | GISTDA direct |
| `GET` | `https://sdnmapportal.sdnthailand.com/api/google-maps` | Google Maps API Key |
| `GET` | `https://sdnmapportal.sdnthailand.com/api/auth/session` | ดู session |
| `GET` | `https://sdnmapportal.sdnthailand.com/api/auth/csrf` | ดึง CSRF token |

### Auth APIs

| Method | URL | Body | Description |
|--------|-----|------|-------------|
| `POST` | `https://sdnmapportal.sdnthailand.com/api/auth/signup` | form-data: firstName, lastName, email, password | สมัครสมาชิก |
| `POST` | `https://sdnmapportal.sdnthailand.com/api/auth/forgot-password` | JSON: `{"email":"..."}` | ส่ง reset link |
| `POST` | `https://sdnmapportal.sdnthailand.com/api/auth/reset-password` | JSON: `{"token":"...","password":"..."}` | รีเซ็ตรหัสผ่าน |

### Admin APIs (ต้อง session cookie)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `https://sdnmapportal.sdnthailand.com/api/users` | รายชื่อ user ทั้งหมด |
| `GET` | `https://sdnmapportal.sdnthailand.com/api/users/1` | ดูข้อมูล user |
| `PUT` | `https://sdnmapportal.sdnthailand.com/api/users/1` | เปลี่ยน role |
| `DELETE` | `https://sdnmapportal.sdnthailand.com/api/users/1` | ลบ user |

---

## Integration Guide for sdnthailand.com

### Option 1: Embed via iframe

```html
<iframe
  src="https://sdnmapportal.sdnthailand.com"
  width="100%"
  height="800px"
  style="border: none; border-radius: 8px;"
></iframe>
```

### Option 2: Build Map Component (Leaflet)

ติดตั้ง dependencies:

```bash
npm install leaflet react-leaflet @types/leaflet
```

ดึงข้อมูลจาก API:

```typescript
// ดึงเอกสารทั้งหมดผ่าน server action
// หรือสร้าง API endpoint ใหม่:
// GET /api/public/documents - return published documents

const response = await fetch('https://sdnmapportal.sdnthailand.com/api/documents');
```

ไฟล์สำคัญที่ต้อง copy:
- `app/data/thailand.json` - GeoJSON 77 จังหวัด
- `app/utils/colorGenerator.ts` - สีและ THAILAND_BOUNDS
- `app/utils/provinceCoordinates.ts` - พิกัดจังหวัด
- `app/dashboard/map/components/ProvinceHighlight.tsx` - polygon highlight

### Option 3: Build Map Component (Google Maps)

```bash
npm install @react-google-maps/api
```

ไฟล์สำคัญที่ต้อง copy:
- `app/google/components/GoogleMapView.tsx`
- `app/google/components/GoogleProvinceHighlight.tsx`
- `app/google/components/GoogleProvinceOverlay.tsx`

---

*Generated: February 2026*
*Project: SDN Map Portal - sdnmapportal.sdnthailand.com*
