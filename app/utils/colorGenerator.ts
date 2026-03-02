// app/utils/colorGenerator.ts
// ชุดสีจาก Tailwind CSS (shade-500) — เรียงแบบ interleaved ให้ category ต่อกันได้สีห่างกันบนวงล้อสี

const COLOR_PALETTE = [
  '#EF4444', //  1. red-500      - แดง           (0°)
  '#06B6D4', //  2. cyan-500     - ฟ้าเขียว      (189°) ← ตรงข้ามแดง
  '#22C55E', //  3. green-500    - เขียว         (142°)
  '#A855F7', //  4. purple-500   - ม่วง          (271°) ← ตรงข้ามเขียว
  '#F97316', //  5. orange-500   - ส้ม           (25°)
  '#3B82F6', //  6. blue-500     - น้ำเงิน       (217°) ← ตรงข้ามส้ม
  '#FACC15', //  7. yellow-400   - เหลือง        (48°)
  '#EC4899', //  8. pink-500     - ชมพู          (328°)
  '#84CC16', //  9. lime-500     - มะนาว         (83°)
  '#6366F1', // 10. indigo-500   - คราม          (239°)
  '#14B8A6', // 11. teal-500     - เขียวอมฟ้า    (175°)
  '#D946EF', // 12. fuchsia-500  - ฟิวเชีย       (292°)
  '#F59E0B', // 13. amber-500    - อำพัน         (38°)
  '#0EA5E9', // 14. sky-500      - ฟ้าอ่อน       (199°)
  '#8B5CF6', // 15. violet-500   - ไวโอเล็ต      (258°)
  '#F43F5E', // 16. rose-500     - กุหลาบ        (350°)
];

export interface CategoryColorScheme {
  id: number;
  primary: string;
  light: string;
  dark: string;
  text: string;
}

/**
 * สร้างสีสำหรับหมวดหมู่โดยอัตโนมัติจาก ID
 * @param id ID ของหมวดหมู่
 * @returns ชุดสีสำหรับหมวดหมู่
 */
export function getCategoryColor(id: number): CategoryColorScheme {
  // กำหนดสีจาก COLOR_PALETTE ตาม ID (วนกลับเมื่อ ID มากกว่าจำนวนสีที่มี)
  const colorIndex = (id - 1) % COLOR_PALETTE.length;
  const primary = COLOR_PALETTE[colorIndex];
  
  // สร้างสีอ่อนและสีเข้มโดยอัตโนมัติ
  return {
    id,
    primary,
    light: `${primary}20`, // เพิ่มความโปร่งใส 20%
    dark: shadeColor(primary, -20), // สีเข้มกว่าเดิม 20%
    text: primary,
  };
}

/**
 * สร้างสีสำหรับหมวดหมู่โดยอัตโนมัติจากชื่อ (ใช้ในกรณีที่ไม่มี ID)
 * @param name ชื่อของหมวดหมู่
 * @returns ชุดสีสำหรับหมวดหมู่
 */
export function generateColorByName(name: string): CategoryColorScheme {
  // คำนวณค่า hash จากชื่อ
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // ใช้ค่า hash เพื่อเลือกสีจาก COLOR_PALETTE
  const colorIndex = Math.abs(hash) % COLOR_PALETTE.length;
  const primary = COLOR_PALETTE[colorIndex];
  
  return {
    id: colorIndex + 1,
    primary,
    light: `${primary}20`,
    dark: shadeColor(primary, -20),
    text: primary,
  };
}

/**
 * ปรับความเข้มของสี
 * @param color สีในรูปแบบ hex
 * @param percent เปอร์เซ็นต์การปรับ (-100 ถึง 100)
 * @returns สีที่ปรับแล้วในรูปแบบ hex
 */
function shadeColor(color: string, percent: number): string {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = R > 0 ? R : 0;
  G = G > 0 ? G : 0;
  B = B > 0 ? B : 0;

  const rr = R.toString(16).padStart(2, '0');
  const gg = G.toString(16).padStart(2, '0');
  const bb = B.toString(16).padStart(2, '0');

  return `#${rr}${gg}${bb}`;
}

export const THAILAND_BOUNDS = {
  center: [13.736717, 100.523186] as [number, number],
  zoom: 6,
  minZoom: 5,
  maxZoom: 18,
  // ขยาย bounds เพื่อให้ fitBounds มีที่ว่างสำหรับ padding (หลบ sidebar)
  // จังหวัดติดขอบ เช่น แม่ฮ่องสอน (ตะวันตก) จะได้แสดงตรงกลางได้
  bounds: [
    [4.0, 94.0] as [number, number],   // Southwest - ขยายลงใต้และไปทางตะวันตก
    [22.0, 109.0] as [number, number], // Northeast - ขยายขึ้นเหนือและไปทางตะวันออก
  ] as [[number, number], [number, number]],
};