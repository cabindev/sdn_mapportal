// app/utils/groupDocumentsByLocation.ts
// รวมเอกสารที่อยู่ในพิกัดเดียวกัน (เช่น ผู้ใช้กรอกที่อยู่เดียวกัน) ไว้เป็นกลุ่มเดียว
// เพื่อไม่ให้หมุดวางทับกันจนมองไม่เห็นข้อมูลก่อนหน้า

// ปัดพิกัดที่ทศนิยม 5 ตำแหน่ง (~1.1 เมตร) ถือว่าเป็น "จุดเดียวกัน"
const COORDINATE_PRECISION = 5;

export interface DocumentLocationGroup<T> {
  /** คีย์ของกลุ่ม (พิกัดที่ปัดแล้ว) ใช้เป็น React key ได้ */
  key: string;
  /** พิกัดตัวแทนของกลุ่ม (ใช้ของเอกสารล่าสุด) */
  latitude: number;
  longitude: number;
  /** เอกสารทั้งหมดในจุดนี้ เรียงใหม่สุดก่อน */
  documents: T[];
}

/**
 * จัดกลุ่มเอกสารตามพิกัด เอกสารที่พิกัดตรงกัน (หลังปัดทศนิยม) จะถูกรวมเป็นกลุ่มเดียว
 * ภายในกลุ่มเรียงตามวันที่สร้างจากใหม่ไปเก่า เพื่อให้เอกสารล่าสุดเป็นตัวแทน
 */
export function groupDocumentsByLocation<
  T extends { latitude: number; longitude: number; createdAt: Date | string }
>(documents: T[]): DocumentLocationGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const doc of documents) {
    const key = `${doc.latitude.toFixed(COORDINATE_PRECISION)},${doc.longitude.toFixed(
      COORDINATE_PRECISION
    )}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(doc);
    } else {
      groups.set(key, [doc]);
    }
  }

  return Array.from(groups.entries()).map(([key, docs]) => {
    const sorted = [...docs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      key,
      latitude: sorted[0].latitude,
      longitude: sorted[0].longitude,
      documents: sorted,
    };
  });
}
