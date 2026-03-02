// app/utils/colorGenerator.ts
// ชุดสีที่แตกต่างกันชัดเจน — เรียงแบบ interleaved ให้ category ต่อกันได้สีตรงข้ามบนวงล้อสี

const COLOR_PALETTE = [
  '#FF4444', //  1. Red        - แดงสด          (0°)
  '#00DDDD', //  2. Cyan       - ฟ้าเขียวสด     (180°) ← ตรงข้ามแดง
  '#44BB44', //  3. Green      - เขียวสด         (120°)
  '#AA44FF', //  4. Purple     - ม่วงสด          (270°) ← ตรงข้ามเขียว
  '#FF8800', //  5. Orange     - ส้มสด           (30°)
  '#4488FF', //  6. Blue       - น้ำเงินสด       (210°) ← ตรงข้ามส้ม
  '#FFDD00', //  7. Yellow     - เหลืองสด        (55°)
  '#FF44AA', //  8. Pink       - ชมพูสด          (330°) ← ตรงข้ามเหลือง
  '#795548', //  9. Brown      - น้ำตาล          (earthy — ต่างจากทุกสีข้างบน)
  '#00897B', // 10. Teal       - เขียวอมฟ้าเข้ม  (158°) ← เข้มกว่า Cyan มาก
  '#CDDC39', // 11. Lime       - เหลืองมะนาว    (82°)  ← ระหว่าง Yellow กับ Green
  '#5C6BC0', // 12. Indigo     - คราม           (233°) ← ระหว่าง Blue กับ Purple
  '#E040FB', // 13. Magenta    - ม่วงชมพูสด      (295°)
  '#558B2F', // 14. Olive      - เขียวมะกอก      (94°)  ← เข้มกว่า Lime มาก
  '#FFB300', // 15. Amber      - เหลืองอำพัน    (42°)  ← ระหว่าง Orange กับ Yellow
  '#607D8B', // 16. Blue Grey  - เทาน้ำเงิน     (neutral — เย็นแต่ desaturated)
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