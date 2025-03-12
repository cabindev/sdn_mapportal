// app/utils/colorGenerator.ts
// ชุดสีสดใสและทันสมัย

const COLOR_PALETTE = [
  '#FF3B30', // Vivid Red (Apple)
  '#FF9500', // Vibrant Orange
  '#FFCC00', // Bright Yellow
  '#34C759', // Fresh Green (Apple)
  '#00C7BE', // Turquoise
  '#007AFF', // Vibrant Blue (Apple)
  '#5856D6', // Electric Purple
  '#AF52DE', // Bright Violet (Apple)
  '#FF2D55', // Pink (Apple)
  '#5AC8FA', // Sky Blue (Apple)
  '#4CD964', // Lime Green
  '#FF6B22', // Deep Orange
  '#FF453A', // Coral Red
  '#32ADE6', // Cyan Blue
  '#BF5AF2', // Lavender Purple
  '#FF375F', // Rose
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
  bounds: [
    [6.0, 97.0] as [number, number], 
    [20.0, 106.5] as [number, number], 
  ] as [[number, number], [number, number]], 
};