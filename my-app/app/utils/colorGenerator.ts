// app/utils/colorGenerator.ts
// ชุดสีสดใสและทันสมัย

const COLOR_PALETTE = [
  '#FF4444', // Bright Red - แดงสด
  '#FF8800', // Vivid Orange - ส้มสด  
  '#FFDD00', // Bright Yellow - เหลืองสด
  '#44BB44', // Bright Green - เขียวสด
  '#00DDDD', // Bright Cyan - ฟ้าเขียวสด
  '#4488FF', // Bright Blue - น้ำเงินสด
  '#AA44FF', // Bright Purple - ม่วงสด
  '#FF44AA', // Bright Pink - ชมพูสด
  '#FF7722', // Bright Orange-Red - ส้มแดงสด
  '#66DD66', // Light Green - เขียวอ่อนสด
  '#FF6699', // Light Pink - ชมพูอ่อนสด
  '#6666FF', // Light Blue - น้ำเงินอ่อนสด
  '#FFAA00', // Bright Amber - เหลืองทองสด
  '#22DDAA', // Turquoise - เขียวฟ้าสด
  '#BB44BB', // Magenta - ม่วงแดงสด
  '#DDAA44', // Golden - ทองคำสด
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